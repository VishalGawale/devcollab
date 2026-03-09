export interface User {
  id: string;
  email: string;
  name: string | null;
  username: string;
  avatarUrl: string | null;
  githubId: string;
}

export interface Repository {
  id: string;
  githubId: string;
  name: string;
  fullName: string;
  description: string | null;
  private: boolean;
  defaultBranch: string;
  lastSyncedAt: string;
  createdAt: string;
  updatedAt: string;
}
