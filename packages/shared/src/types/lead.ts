// Lead Types

export interface Lead {
  id: string;
  userId: string;
  igUserId: string;
  igUsername: string;
  email?: string;
  phone?: string;
  name?: string;
  customFields?: Record<string, string>;
  tags: string[];
  source?: string;
  sourceCampaignId?: string;
  firstInteractionAt: Date;
  lastInteractionAt: Date;
  totalInteractions: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadDto {
  igUserId: string;
  igUsername: string;
  email?: string;
  phone?: string;
  name?: string;
  customFields?: Record<string, string>;
  tags?: string[];
  source?: string;
  sourceCampaignId?: string;
}

export interface UpdateLeadDto {
  email?: string;
  phone?: string;
  name?: string;
  customFields?: Record<string, string>;
  tags?: string[];
}

export interface LeadFilters {
  search?: string;
  tags?: string[];
  hasEmail?: boolean;
  source?: string;
  sourceCampaignId?: string;
  page?: number;
  limit?: number;
}
