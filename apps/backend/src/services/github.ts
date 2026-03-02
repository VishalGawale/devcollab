import { prisma } from "../utils/prisma";

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

export class GitHubService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  // Fetch user's organizations
  async getOrganizations() {
    const response = await fetch("https://api.github.com/user/orgs", {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
      },
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
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: "application/vnd.github.v3+json",
          },
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
  async syncRepositories(org: string, teamId: string) {
    const repos = await this.getOrgRepositories(org);

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
