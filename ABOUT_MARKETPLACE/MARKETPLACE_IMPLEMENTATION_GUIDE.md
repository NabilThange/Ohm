# Marketplace Implementation Guide

## Overview

The Marketplace is a feature that allows users to browse, download, and use pre-built project templates created by the community or OhmAI team. This document outlines the complete implementation strategy for integrating the Marketplace into the existing Supabase database and application architecture.

---

## Current Implementation (MVP)

### What's Done
- ✅ Marketplace button added to Sidebar (both expanded and collapsed views)
- ✅ `/marketplace` page created with mock data
- ✅ Basic UI with search, filters, and template cards
- ✅ Category and difficulty filtering
- ✅ Responsive design matching existing app theme

### Mock Data Structure
```typescript
{
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  author: string
  downloads: number
  rating: number
  price: "Free" | "Premium"
  thumbnail: string (emoji for now)
  components: string[]
  difficulty: "Easy" | "Intermediate" | "Advanced"
}
```

---

## Database Schema Design

### New Tables Required

#### 1. `marketplace_templates` Table
Stores all marketplace templates with metadata.

```sql
CREATE TABLE marketplace_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT, -- Detailed markdown description
  thumbnail_url TEXT, -- URL to template thumbnail image
  
  -- Categorization
  category TEXT NOT NULL, -- 'Beginner', 'IoT', 'Robotics', etc.
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Intermediate', 'Advanced')),
  tags TEXT[] DEFAULT '{}', -- Array of tags for search
  
  -- Author & Attribution
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL, -- Display name
  is_official BOOLEAN DEFAULT FALSE, -- OhmAI official templates
  
  -- Pricing & Access
  price_type TEXT NOT NULL CHECK (price_type IN ('Free', 'Premium', 'Pro')),
  price_amount DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Stats
  downloads_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3, 2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT FALSE,
  featured_order INTEGER, -- For ordering featured templates
  
  -- Version Control
  version TEXT DEFAULT '1.0.0',
  
  -- Search Optimization
  search_vector TSVECTOR -- For full-text search
);

-- Indexes
CREATE INDEX idx_marketplace_templates_category ON marketplace_templates(category);
CREATE INDEX idx_marketplace_templates_difficulty ON marketplace_templates(difficulty);
CREATE INDEX idx_marketplace_templates_status ON marketplace_templates(status);
CREATE INDEX idx_marketplace_templates_featured ON marketplace_templates(featured, featured_order);
CREATE INDEX idx_marketplace_templates_author ON marketplace_templates(author_id);
CREATE INDEX idx_marketplace_templates_search ON marketplace_templates USING GIN(search_vector);

-- Trigger for search vector
CREATE TRIGGER marketplace_templates_search_vector_update
BEFORE INSERT OR UPDATE ON marketplace_templates
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.english', name, description, tags);
```

#### 2. `marketplace_template_content` Table
Stores the actual template content (BOM, code, context, etc.)

```sql
CREATE TABLE marketplace_template_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Content Types (similar to artifacts)
  context_content TEXT, -- Project context/description
  mvp_content TEXT, -- MVP definition
  prd_content TEXT, -- Product requirements
  bom_content_json JSONB, -- Bill of Materials
  code_content_json JSONB, -- Code files
  wiring_content_json JSONB, -- Wiring diagram data
  wiring_diagram_svg TEXT, -- SVG diagram
  budget_content_json JSONB, -- Budget breakdown
  
  -- Additional Resources
  images_urls TEXT[], -- Array of image URLs
  video_url TEXT, -- Tutorial video
  documentation_url TEXT, -- External docs link
  github_url TEXT, -- GitHub repository
  
  UNIQUE(template_id) -- One content record per template
);

CREATE INDEX idx_template_content_template ON marketplace_template_content(template_id);
```

#### 3. `marketplace_template_components` Table
Detailed component list for each template

```sql
CREATE TABLE marketplace_template_components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  
  -- Component Details
  component_name TEXT NOT NULL,
  component_type TEXT, -- 'Microcontroller', 'Sensor', 'Actuator', etc.
  quantity INTEGER DEFAULT 1,
  specifications TEXT,
  estimated_price DECIMAL(10, 2),
  purchase_links JSONB, -- Array of {vendor, url, price}
  
  -- Ordering
  display_order INTEGER DEFAULT 0
);

CREATE INDEX idx_template_components_template ON marketplace_template_components(template_id);
```

#### 4. `marketplace_downloads` Table
Track user downloads for analytics and "My Templates"

```sql
CREATE TABLE marketplace_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Usage tracking
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL, -- If used in a chat
  
  UNIQUE(user_id, template_id, chat_id)
);

CREATE INDEX idx_marketplace_downloads_user ON marketplace_downloads(user_id);
CREATE INDEX idx_marketplace_downloads_template ON marketplace_downloads(template_id);
CREATE INDEX idx_marketplace_downloads_chat ON marketplace_downloads(chat_id);
```

#### 5. `marketplace_ratings` Table
User ratings and reviews

```sql
CREATE TABLE marketplace_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Rating
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  -- Moderation
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  
  UNIQUE(user_id, template_id)
);

CREATE INDEX idx_marketplace_ratings_template ON marketplace_ratings(template_id);
CREATE INDEX idx_marketplace_ratings_user ON marketplace_ratings(user_id);
```

#### 6. `marketplace_collections` Table
Curated collections of templates

```sql
CREATE TABLE marketplace_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  
  curator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_official BOOLEAN DEFAULT FALSE,
  
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE TABLE marketplace_collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES marketplace_collections(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  
  UNIQUE(collection_id, template_id)
);
```

---

## API Endpoints

### Template Browsing

#### `GET /api/marketplace/templates`
Fetch templates with filtering and pagination

**Query Parameters:**
- `category` - Filter by category
- `difficulty` - Filter by difficulty
- `tags` - Comma-separated tags
- `search` - Search query
- `featured` - Boolean for featured only
- `page` - Page number
- `limit` - Items per page
- `sort` - Sort by: `popular`, `recent`, `rating`, `downloads`

**Response:**
```typescript
{
  templates: Template[],
  total: number,
  page: number,
  limit: number
}
```

#### `GET /api/marketplace/templates/[id]`
Get detailed template information

**Response:**
```typescript
{
  template: Template,
  content: TemplateContent,
  components: Component[],
  relatedTemplates: Template[]
}
```

### Template Usage

#### `POST /api/marketplace/templates/[id]/use`
Create a new chat from a template

**Request Body:**
```typescript
{
  userId: string,
  customizations?: {
    projectName?: string,
    modifications?: string
  }
}
```

**Response:**
```typescript
{
  chatId: string,
  message: string
}
```

**Implementation Logic:**
1. Fetch template content from `marketplace_template_content`
2. Create new chat in `chats` table
3. Create artifacts for each content type (BOM, code, context, etc.)
4. Record download in `marketplace_downloads`
5. Increment `downloads_count` in `marketplace_templates`
6. Return new chat ID for navigation

#### `POST /api/marketplace/templates/[id]/download`
Track download without creating chat (for future export feature)

### Ratings & Reviews

#### `POST /api/marketplace/templates/[id]/rate`
Submit or update rating

**Request Body:**
```typescript
{
  userId: string,
  rating: number, // 1-5
  review?: string
}
```

#### `GET /api/marketplace/templates/[id]/reviews`
Get reviews for a template

### User Library

#### `GET /api/marketplace/my-templates`
Get user's downloaded/purchased templates

**Response:**
```typescript
{
  templates: Template[],
  downloads: Download[]
}
```

---

## Frontend Components

### New Components to Create

#### 1. `TemplateCard.tsx`
Reusable template card component
- Thumbnail
- Title, description
- Rating, downloads
- Tags
- "Use Template" button
- Price badge

#### 2. `TemplateDetailModal.tsx`
Detailed view when clicking a template
- Full description
- Component list with prices
- Preview images
- Code snippets
- Reviews section
- "Use Template" CTA

#### 3. `TemplateFilters.tsx`
Advanced filtering sidebar
- Category checkboxes
- Difficulty range
- Price filters
- Tag cloud
- Sort options

#### 4. `MyTemplatesPage.tsx`
User's template library at `/marketplace/my-templates`
- Downloaded templates
- Purchase history
- Quick access to create new project from template

#### 5. `TemplateCreator.tsx` (Future)
Allow users to publish their own templates
- Form for metadata
- Upload content
- Preview before publishing
- Submission for review

---

## Integration Points

### 1. Chat Creation Flow
When user clicks "Use Template":
```typescript
// lib/marketplace/template-loader.ts
export async function createChatFromTemplate(
  templateId: string,
  userId: string,
  customizations?: any
) {
  // 1. Fetch template content
  const template = await fetchTemplateWithContent(templateId)
  
  // 2. Create new chat
  const chat = await ChatService.createChat(userId, template.name)
  
  // 3. Create artifacts from template content
  if (template.content.bom_content_json) {
    await ArtifactService.createArtifact(
      chat.id,
      'bom',
      template.content.bom_content_json,
      'agent'
    )
  }
  
  if (template.content.code_content_json) {
    await ArtifactService.createArtifact(
      chat.id,
      'code',
      template.content.code_content_json,
      'agent'
    )
  }
  
  // ... repeat for other artifact types
  
  // 4. Record download
  await recordTemplateDownload(userId, templateId, chat.id)
  
  // 5. Create initial message explaining the template
  await ChatService.createMessage(
    chat.id,
    'assistant',
    `I've loaded the "${template.name}" template for you. This project includes:\n\n${generateTemplateOverview(template)}\n\nWhat would you like to customize or build upon?`
  )
  
  return chat
}
```

### 2. Sidebar Integration
- "Marketplace" button already added ✅
- Add "My Templates" section in sidebar (future)
- Quick access to recently used templates

### 3. Search Integration
- Add marketplace templates to global search
- Show template results alongside chat results

### 4. Agent Integration
When user asks "Show me Arduino projects":
- Agent can query marketplace
- Suggest relevant templates
- Offer to load template directly

---

## Business Logic

### Template Publishing Workflow
1. **Draft** - Creator working on template
2. **Submitted** - Awaiting review (if community submissions enabled)
3. **Published** - Live in marketplace
4. **Archived** - Removed from public view but preserved

### Pricing Tiers
- **Free** - Community templates, basic projects
- **Premium** - Advanced templates, $2-10
- **Pro** - Enterprise templates, custom pricing

### Revenue Sharing (Future)
- 70% to creator
- 30% to platform
- Official OhmAI templates: 100% to platform

### Quality Control
- Automated checks:
  - Valid BOM format
  - Code syntax validation
  - Component availability check
- Manual review for featured templates
- User reporting system for issues

---

## Analytics & Metrics

### Track:
- Template views
- Download conversions
- Search queries (for trending topics)
- User ratings
- Completion rates (did they finish the project?)
- Component purchase tracking (affiliate links)

### Dashboard Metrics:
- Most popular templates
- Trending categories
- User engagement
- Revenue (if monetized)

---

## Migration Plan

### Phase 1: Database Setup
1. Create all tables via migration
2. Seed with initial official templates
3. Test data integrity

### Phase 2: API Development
1. Build template fetching endpoints
2. Implement template-to-chat conversion
3. Add rating/review system

### Phase 3: Frontend Enhancement
1. Replace mock data with real API calls
2. Add template detail modal
3. Implement "Use Template" flow

### Phase 4: Advanced Features
1. User template submissions
2. Collections/playlists
3. Template versioning
4. Export/import functionality

### Phase 5: Monetization (Optional)
1. Payment integration (Stripe)
2. Premium template access
3. Subscription tiers
4. Affiliate component links

---

## Security Considerations

### Access Control
- Public templates: Anyone can view
- Premium templates: Require purchase/subscription
- Draft templates: Only creator can view
- Admin panel: Template moderation

### Content Validation
- Sanitize all user-generated content
- Validate JSON structures
- Scan for malicious code
- Rate limiting on downloads

### RLS Policies
```sql
-- Public can read published templates
CREATE POLICY "Public templates are viewable by everyone"
ON marketplace_templates FOR SELECT
USING (status = 'published');

-- Users can rate templates they've downloaded
CREATE POLICY "Users can rate downloaded templates"
ON marketplace_ratings FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM marketplace_downloads
    WHERE user_id = auth.uid() AND template_id = marketplace_ratings.template_id
  )
);

-- Creators can manage their own templates
CREATE POLICY "Creators can manage their templates"
ON marketplace_templates FOR ALL
USING (auth.uid() = author_id);
```

---

## Testing Strategy

### Unit Tests
- Template data validation
- Price calculations
- Rating aggregation

### Integration Tests
- Template to chat conversion
- Download tracking
- Search functionality

### E2E Tests
- Browse marketplace
- Use template to create project
- Submit rating
- Search and filter

---

## Future Enhancements

### Community Features
- Template remixes (fork and modify)
- User profiles with published templates
- Following favorite creators
- Template discussions/comments

### AI Integration
- AI-generated template suggestions
- Automatic template creation from chat history
- Smart component substitutions
- Cost optimization recommendations

### Collaboration
- Team template libraries
- Private organizational templates
- Template sharing within workspaces

### Advanced Search
- Visual similarity search
- Component-based search ("Find projects using ESP32")
- Difficulty progression paths
- Learning tracks

---

## Implementation Checklist

### Immediate (MVP Enhancement)
- [ ] Create database tables
- [ ] Build API endpoints for template fetching
- [ ] Replace mock data with real data
- [ ] Implement "Use Template" functionality
- [ ] Add template detail view

### Short Term (1-2 months)
- [ ] Rating and review system
- [ ] My Templates library
- [ ] Advanced filtering
- [ ] Template collections
- [ ] Search optimization

### Medium Term (3-6 months)
- [ ] User template submissions
- [ ] Template versioning
- [ ] Export/import features
- [ ] Analytics dashboard
- [ ] Mobile optimization

### Long Term (6+ months)
- [ ] Monetization system
- [ ] AI template generation
- [ ] Collaboration features
- [ ] Advanced analytics
- [ ] API for third-party integrations

---

## Code Examples

### Service Layer
```typescript
// lib/marketplace/marketplace-service.ts
export class MarketplaceService {
  static async getTemplates(filters: TemplateFilters) {
    const { data, error } = await supabase
      .from('marketplace_templates')
      .select(`
        *,
        marketplace_template_content(*),
        marketplace_template_components(*)
      `)
      .eq('status', 'published')
      .order('downloads_count', { ascending: false })
      .range(filters.offset, filters.offset + filters.limit)
    
    return data
  }
  
  static async useTemplate(templateId: string, userId: string) {
    // Implementation from integration section above
  }
  
  static async rateTemplate(
    templateId: string,
    userId: string,
    rating: number,
    review?: string
  ) {
    // Insert or update rating
    // Recalculate average rating
    // Update template rating_average and rating_count
  }
}
```

### React Hook
```typescript
// lib/hooks/use-marketplace.ts
export function useMarketplace(filters: TemplateFilters) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadTemplates() {
      const data = await MarketplaceService.getTemplates(filters)
      setTemplates(data)
      setLoading(false)
    }
    loadTemplates()
  }, [filters])
  
  return { templates, loading }
}
```

---

## Conclusion

This marketplace feature will significantly enhance the OhmAI platform by:
1. Reducing time-to-start for new users
2. Showcasing platform capabilities
3. Building community engagement
4. Creating potential revenue streams
5. Establishing OhmAI as a comprehensive hardware development platform

The phased approach allows for iterative development while maintaining system stability and user experience quality.
