import { z } from 'zod';

// ============================================
// CONSTANTS
// ============================================

const RESERVED_USERNAMES = [
  'admin', 'api', 'app', 'auth', 'blog', 'dashboard', 'help',
  'login', 'logout', 'profile', 'register', 'settings', 'support',
  'www', 'chatrist', 'about', 'contact', 'terms', 'privacy',
  'pricing', 'features', 'docs', 'status', 'null', 'undefined',
] as const;

export const BUTTON_STYLES = ['rounded', 'pill', 'sharp', 'outline'] as const;

export const FONT_OPTIONS = [
  'Inter', 'Poppins', 'Roboto', 'Playfair Display', 'Space Grotesk',
  'DM Sans', 'Lora', 'Montserrat',
] as const;

// ============================================
// USERNAME SCHEMA
// ============================================

export const UsernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores')
  .transform((val) => val.toLowerCase())
  .refine(
    (val) => !RESERVED_USERNAMES.includes(val as typeof RESERVED_USERNAMES[number]),
    'This username is reserved'
  );

// ============================================
// PROFILE LINK SCHEMA
// ============================================

export const ProfileLinkSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, 'Link title is required').max(100, 'Title must be less than 100 characters'),
  url: z.string().url('Must be a valid URL'),
  icon: z.string().max(50).optional().default(''),
  isActive: z.boolean().default(true),
});

// ============================================
// PROFILE THEME SCHEMA
// ============================================

const HexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color (e.g. #6366f1)');

export const ProfileThemeSchema = z.object({
  primaryColor: HexColorSchema.default('#6366f1'),
  backgroundColor: HexColorSchema.default('#ffffff'),
  textColor: HexColorSchema.default('#0f172a'),
  buttonStyle: z.enum(BUTTON_STYLES).default('rounded'),
  font: z.string().default('Inter'),
});

// ============================================
// PROFILE SCHEMAS
// ============================================

export const CreatePublicProfileSchema = z.object({
  username: UsernameSchema,
  displayName: z.string().max(100, 'Display name must be less than 100 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatarUrl: z.string().url().optional(),
  links: z.array(ProfileLinkSchema).max(20, 'Maximum 20 links allowed').default([]),
  theme: ProfileThemeSchema.default({}),
  isPublished: z.boolean().default(false),
  seoTitle: z.string().max(60, 'SEO title must be less than 60 characters').optional(),
  seoDescription: z.string().max(160, 'SEO description must be less than 160 characters').optional(),
});

export const UpdatePublicProfileSchema = z.object({
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  links: z.array(ProfileLinkSchema).max(20).optional(),
  theme: ProfileThemeSchema.optional(),
  isPublished: z.boolean().optional(),
  seoTitle: z.string().max(60).nullable().optional(),
  seoDescription: z.string().max(160).nullable().optional(),
});

// ============================================
// TYPES
// ============================================

export type ProfileLink = z.infer<typeof ProfileLinkSchema>;
export type ProfileTheme = z.infer<typeof ProfileThemeSchema>;
export type CreatePublicProfileInput = z.infer<typeof CreatePublicProfileSchema>;
export type UpdatePublicProfileInput = z.infer<typeof UpdatePublicProfileSchema>;

export interface PublicProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  links: ProfileLink[];
  theme: ProfileTheme;
  isPublished: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatabasePublicProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  links: ProfileLink[];
  theme: ProfileTheme;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}
