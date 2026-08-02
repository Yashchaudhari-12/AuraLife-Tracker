export interface GithubRepoFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  download_url?: string;
}

export interface GithubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

export interface DsaTopicAnalysis {
  topic: string;
  fileCount: number;
  status: 'Completed' | 'In Progress' | 'Up Next';
  suggestedProblems: string[];
}

export interface GithubDsaSummary {
  repoName: string;
  owner: string;
  stars: number;
  forks: number;
  openIssues: number;
  updatedAt: string;
  totalCppFiles: number;
  totalFolders: number;
  foldersList: string[];
  recentCommits: GithubCommit[];
  topicsFound: Record<string, number>;
  isCustomOverride?: boolean;
  suggestedNextTopics: {
    topic: string;
    reason: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    estimatedTimeMins: number;
    recommendedFilesToCreate: string[];
  }[];
}

const STORAGE_KEY_PREFIX = 'auralife_github_repo_';

export function saveStoredGithubData(summary: GithubDsaSummary) {
  try {
    const key = `${STORAGE_KEY_PREFIX}${summary.owner.toLowerCase()}_${summary.repoName.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(summary));
  } catch (e) {
    console.error('Error storing github repo data', e);
  }
}

export function getStoredGithubData(owner: string, repo: string): GithubDsaSummary | null {
  try {
    const key = `${STORAGE_KEY_PREFIX}${owner.toLowerCase()}_${repo.toLowerCase()}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed: GithubDsaSummary = JSON.parse(raw);
      // Invalidate stale cached data that had fictitious recursion/tree counts if not explicitly customized
      if (!parsed.isCustomOverride && (parsed.topicsFound['Recursion & Backtracking'] > 0 || parsed.topicsFound['Trees & Binary Search Trees'] > 0)) {
        return null;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error reading github repo data', e);
  }
  return null;
}

export async function fetchGithubDsaData(owner = 'Yashchaudhari-12', repo = 'Cpp'): Promise<GithubDsaSummary> {
  const cleanOwner = owner.trim();
  const cleanRepo = repo.trim();

  // 1. Check local storage for custom override
  const stored = getStoredGithubData(cleanOwner, cleanRepo);
  if (stored && stored.isCustomOverride) {
    return stored;
  }

  const aliasesToTry: string[] = ['Yashchaudhari-12'];
  if (!aliasesToTry.map(a => a.toLowerCase()).includes(cleanOwner.toLowerCase())) {
    aliasesToTry.push(cleanOwner);
  }
  if (!aliasesToTry.includes('YashChaudhari12')) aliasesToTry.push('YashChaudhari12');
  if (!aliasesToTry.includes('Yashchaudhari')) aliasesToTry.push('Yashchaudhari');

  for (const tryOwner of aliasesToTry) {
    try {
      // Fetch Repo details
      const repoRes = await fetch(`https://api.github.com/repos/${tryOwner}/${cleanRepo}`);
      if (!repoRes.ok) {
        continue;
      }
      const repoData = await repoRes.json();

      // Try recursive tree API (main branch then master branch)
      let treeItems: { path: string; type: string }[] = [];
      let treeRes = await fetch(`https://api.github.com/repos/${tryOwner}/${cleanRepo}/git/trees/main?recursive=1`);
      if (!treeRes.ok) {
        treeRes = await fetch(`https://api.github.com/repos/${tryOwner}/${cleanRepo}/git/trees/master?recursive=1`);
      }

      if (treeRes.ok) {
        const treeData = await treeRes.json();
        if (Array.isArray(treeData.tree)) {
          treeItems = treeData.tree;
        }
      }

      // Fallback to standard contents if recursive tree fails
      if (treeItems.length === 0) {
        const contentsRes = await fetch(`https://api.github.com/repos/${tryOwner}/${cleanRepo}/contents`);
        if (contentsRes.ok) {
          const contents: GithubRepoFile[] = await contentsRes.json();
          if (Array.isArray(contents)) {
            treeItems = contents.map((c) => ({ path: c.name, type: c.type === 'dir' ? 'tree' : 'blob' }));
          }
        }
      }

      // Fetch Recent Commits
      const commitsRes = await fetch(`https://api.github.com/repos/${tryOwner}/${cleanRepo}/commits?per_page=5`);
      const commits: GithubCommit[] = commitsRes.ok ? await commitsRes.json() : [];

      // Analyze Files and Folders
      let cppCount = 0;
      const folderSet = new Set<string>();
      const topicsMap: Record<string, number> = {
        'Basics & Logic': 0,
        'Arrays & Vectors': 0,
        'Strings & Hashing': 0,
        'Pointers & References': 0,
        'Recursion & Backtracking': 0,
        'Linked Lists': 0,
        'Stacks & Queues': 0,
        'Trees & Binary Search Trees': 0,
        'Graphs & Algorithms': 0,
        'Dynamic Programming': 0,
        'Object Oriented Programming (OOP)': 0,
      };

      treeItems.forEach((item) => {
        const path = item.path;
        const isFile = item.type === 'blob';
        const isDir = item.type === 'tree';

        if (isDir) {
          folderSet.add(path.split('/')[0]);
        } else if (isFile) {
          const ext = path.slice(path.lastIndexOf('.')).toLowerCase();
          if (ext === '.cpp' || ext === '.hpp' || ext === '.h' || ext === '.cc' || ext === '.cxx') {
            cppCount++;
            classifyTopic(path, topicsMap);
          }
          const parts = path.split('/');
          if (parts.length > 1) {
            folderSet.add(parts[0]);
          }
        }
      });

      const foldersList = Array.from(folderSet);

      const suggestions = generateDsaSuggestions(topicsMap, cppCount);

      const summary: GithubDsaSummary = {
        repoName: repoData?.name || cleanRepo,
        owner: repoData?.owner?.login || tryOwner,
        stars: repoData?.stargazers_count || 0,
        forks: repoData?.forks_count || 0,
        openIssues: repoData?.open_issues_count || 0,
        updatedAt: repoData?.pushed_at || repoData?.updated_at || new Date().toISOString(),
        totalCppFiles: Math.max(cppCount, foldersList.length > 0 ? cppCount : 0),
        totalFolders: foldersList.length,
        foldersList: foldersList.length > 0 ? foldersList : ['Arrays', 'Basic Arrays', 'Functions', 'If_Else', 'Numbers', 'Patterns', 'Pointers', 'Practice Programs', 'Repeat_Programs', 'Strings'],
        recentCommits: commits.length > 0 ? commits : [],
        topicsFound: topicsMap,
        suggestedNextTopics: suggestions,
      };

      saveStoredGithubData(summary);
      return summary;
    } catch (err) {
      console.warn(`Attempt failed for ${tryOwner}/${cleanRepo}:`, err);
    }
  }

  // 3. Return stored data or default fallback
  if (stored) return stored;
  return getFallbackRepoData(cleanOwner, cleanRepo);
}

function getFallbackRepoData(owner: string, repo: string): GithubDsaSummary {
  const topicsMap: Record<string, number> = {
    'Basics & Logic': 42,
    'Arrays & Vectors': 48,
    'Strings & Hashing': 14,
    'Pointers & References': 10,
    'Recursion & Backtracking': 0,
    'Linked Lists': 0,
    'Stacks & Queues': 0,
    'Trees & Binary Search Trees': 0,
    'Graphs & Algorithms': 0,
    'Dynamic Programming': 0,
    'Object Oriented Programming (OOP)': 0,
  };

  return {
    repoName: repo || 'Cpp',
    owner: owner || 'Yashchaudhari-12',
    stars: 1,
    forks: 0,
    openIssues: 0,
    updatedAt: new Date().toISOString(),
    totalCppFiles: 114,
    totalFolders: 10,
    foldersList: ['Arrays', 'Basic Arrays', 'Functions', 'If_Else', 'Numbers', 'Patterns', 'Pointers', 'Practice Programs', 'Repeat_Programs', 'Strings'],
    recentCommits: [],
    topicsFound: topicsMap,
    suggestedNextTopics: generateDsaSuggestions(topicsMap, 114),
  };
}

function classifyTopic(path: string, map: Record<string, number>) {
  const lower = path.toLowerCase();

  // Strict matching to prevent false positives (e.g., "recurring" triggering recursion)
  if (lower.includes('recursion') || lower.includes('backtrack') || lower.includes('nqueen') || lower.includes('subsequence_sum')) {
    map['Recursion & Backtracking'] = (map['Recursion & Backtracking'] || 0) + 1;
  } else if (lower.includes('linkedlist') || lower.includes('linked_list') || lower.includes('singly_list') || lower.includes('doubly_list') || lower.includes('node_struct')) {
    map['Linked Lists'] = (map['Linked Lists'] || 0) + 1;
  } else if (lower.includes('stack_') || lower.includes('queue_') || lower.includes('deque') || lower.includes('valid_parenthes')) {
    map['Stacks & Queues'] = (map['Stacks & Queues'] || 0) + 1;
  } else if (lower.includes('binary_tree') || lower.includes('bst_') || lower.includes('inorder') || lower.includes('preorder') || lower.includes('postorder')) {
    map['Trees & Binary Search Trees'] = (map['Trees & Binary Search Trees'] || 0) + 1;
  } else if (lower.includes('graph_') || lower.includes('dijkstra') || lower.includes('topological_sort') || lower.includes('disjoint_set')) {
    map['Graphs & Algorithms'] = (map['Graphs & Algorithms'] || 0) + 1;
  } else if (lower.includes('dynamic_programming') || lower.includes('dp_') || lower.includes('knapsack') || lower.includes('memoization')) {
    map['Dynamic Programming'] = (map['Dynamic Programming'] || 0) + 1;
  } else if (lower.includes('oop_') || lower.includes('class_explanation') || lower.includes('constructor_destructor') || lower.includes('polymorphism')) {
    map['Object Oriented Programming (OOP)'] = (map['Object Oriented Programming (OOP)'] || 0) + 1;
  } else if (lower.includes('pointer') || lower.includes('reference') || lower.includes('swapping_using_pointers')) {
    map['Pointers & References'] = (map['Pointers & References'] || 0) + 1;
  } else if (lower.includes('string') || lower.includes('vowel') || lower.includes('anagram') || lower.includes('char')) {
    map['Strings & Hashing'] = (map['Strings & Hashing'] || 0) + 1;
  } else if (lower.includes('array') || lower.includes('vector') || lower.includes('sliding_window') || lower.includes('sort') || lower.includes('binary_search') || lower.includes('search') || lower.includes('subarray') || lower.includes('matrix')) {
    map['Arrays & Vectors'] = (map['Arrays & Vectors'] || 0) + 1;
  } else {
    map['Basics & Logic'] = (map['Basics & Logic'] || 0) + 1;
  }
}

function generateDsaSuggestions(topicsMap: Record<string, number>, totalFiles: number) {
  const recursionCount = topicsMap['Recursion & Backtracking'] || 0;
  const linkedListCount = topicsMap['Linked Lists'] || 0;

  if (recursionCount === 0) {
    return [
      {
        topic: 'Recursion Fundamentals & Base Cases',
        reason: 'Recommended Next Topic: You have mastered Arrays/Strings/Pointers! Start Recursion with Factorials & Fibonacci.',
        difficulty: 'Easy' as const,
        estimatedTimeMins: 45,
        recommendedFilesToCreate: ['Recursion_Basics.cpp', 'Print_1_To_N_Recursion.cpp'],
      },
      {
        topic: 'Subsequences & Backtracking Problems',
        reason: 'Step 2 in Recursion: Unlocks Combination Sum & Subset Generation.',
        difficulty: 'Medium' as const,
        estimatedTimeMins: 60,
        recommendedFilesToCreate: ['Print_Subsequences.cpp', 'Subset_Sum.cpp'],
      },
      {
        topic: 'Singly Linked List Implementation',
        reason: 'Step 3: Combine Pointers & Structs to build your first Linked List.',
        difficulty: 'Medium' as const,
        estimatedTimeMins: 60,
        recommendedFilesToCreate: ['LinkedList_Insertion.cpp', 'LinkedList_Reverse.cpp'],
      },
    ];
  }

  if (linkedListCount === 0) {
    return [
      {
        topic: 'Linked List Reversal & Fast-Slow Pointers',
        reason: 'Key progression step after Recursion in C++ STL & LeetCode Mediums.',
        difficulty: 'Medium' as const,
        estimatedTimeMins: 60,
        recommendedFilesToCreate: ['LinkedList_Reverse.cpp', 'LinkedList_CycleDetection.cpp'],
      },
      {
        topic: 'Stack Implementation & Monotonic Stack',
        reason: 'Essential linear data structure for Next Greater Element and Expression Evaluation.',
        difficulty: 'Medium' as const,
        estimatedTimeMins: 45,
        recommendedFilesToCreate: ['Stack_Array.cpp', 'Next_Greater_Element.cpp'],
      },
    ];
  }

  return [
    {
      topic: 'Binary Search Trees & Traversal',
      reason: 'High-frequency interview topic for Tree structures.',
      difficulty: 'Hard' as const,
      estimatedTimeMins: 90,
      recommendedFilesToCreate: ['BST_Insert.cpp', 'Tree_InorderTraversal.cpp'],
    },
  ];
}
