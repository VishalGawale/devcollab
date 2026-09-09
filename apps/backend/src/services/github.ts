import { prisma } from "../utils/prisma";

export const DEFAULT_TEAM_ID = "default-team-id";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  default_branch: string;
  updated_at: string;
}

interface GitHubAccount {
  type: "User" | "Organization";
}

export class GitHubService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private githubHeaders() {
    const headers = {
      Authorization: `token ${this.token}`,
      Accept: "application/vnd.github.v3+json",
    };
    return headers;
  }

  async getUser() {
    const response = await fetch("https://api.github.com/user", {
      headers: this.githubHeaders(),
    });

    if (!response.ok) {
      const error = new Error(`GitHub API error: ${response.status}`) as Error & {
        statusCode: number;
      };
      error.statusCode = response.status;
      throw error;
    }

    return response.json();
  }

  // Fetch user's organizations
  async getOrganizations() {
    const response = await fetch("https://api.github.com/user/orgs", {
      headers: this.githubHeaders(),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  // Fetch repositories from organization
  async getOrgRepositories(org: string) {
    const repos: GitHubRepo[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `https://api.github.com/orgs/${org}/repos?per_page=100&page=${page}`,
        {
          headers: this.githubHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = (await response.json()) as GitHubRepo[];
      repos.push(...data);

      hasMore = data.length === 100;
      page++;
    }

    return repos;
  }

  async getAccountType(name: string): Promise<GitHubAccount["type"]> {
    const response = await fetch(`https://api.github.com/users/${name}`, {
      headers: this.githubHeaders(),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const account = (await response.json()) as GitHubAccount;
    return account.type;
  }

  async getUserRepositories(username: string) {
    const repos: GitHubRepo[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&page=${page}`,
        {
          headers: this.githubHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = (await response.json()) as GitHubRepo[];
      repos.push(...data);

      hasMore = data.length === 100;
      page++;
    }

    return repos;
  }

  // Sync repositories to database
  async syncRepositories(name: string, teamId: string) {
    await prisma.team.upsert({
      where: { id: teamId },
      update: {},
      create: {
        id: teamId,
        name: "Default Team",
      },
    });

    const accountType = await this.getAccountType(name);
    const repos =
      accountType === "Organization"
        ? await this.getOrgRepositories(name)
        : await this.getUserRepositories(name);

    const operations = repos.map(async (repo) => {
      return prisma.repository.upsert({
        where: { githubId: String(repo.id) },
        update: {
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          private: repo.private,
          defaultBranch: repo.default_branch,
          lastSyncedAt: new Date(),
        },
        create: {
          githubId: String(repo.id),
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          private: repo.private,
          defaultBranch: repo.default_branch,
          teamId,
          lastSyncedAt: new Date(),
        },
      });
    });

    return Promise.all(operations);
  }
}
