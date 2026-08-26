#!/usr/bin/env python3
"""
extractlogs.py - Extract git commits across ALL branches for one or more authors.

Usage:
    python extractlogs.py -f vicky.commits.md -u vicky vickydecodes
    python extractlogs.py --file output.txt --users vicky --repo /path/to/repo

Notes:
    - Does nothing else besides extracting logs (no commits/pushes/checkouts).
    - -u/--users accepts one or more names/emails (space separated).
    - -f/--file names the output file, which is overwritten (not appended) each run.
"""

import argparse
import subprocess
import sys
from pathlib import Path


def run_git(args, cwd):
    result = subprocess.run(
        ["git"] + args,
        cwd=cwd,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"git error: {result.stderr.strip()}", file=sys.stderr)
        sys.exit(1)
    return result.stdout


def get_all_branches(repo):
    """All local + remote branches, deduplicated by name."""
    out = run_git(["branch", "-a", "--format=%(refname:short)"], repo)
    branches = []
    seen = set()
    for b in out.splitlines():
        b = b.strip()
        if not b or "->" in b:  # skip symbolic refs like origin/HEAD -> origin/main
            continue
        if b not in seen:
            seen.add(b)
            branches.append(b)
    return branches


def get_commits_for_branch(repo, branch, authors):
    """Commits on a branch matching ANY of the given authors (git OR's multiple --author)."""
    log_format = "%H|%an|%ad|%s"
    args = ["log", branch, f"--pretty=format:{log_format}", "--date=short"]
    for a in authors:
        args += ["--author", a]
    out = run_git(args, repo)
    return [line for line in out.splitlines() if line.strip()]


def main():
    parser = argparse.ArgumentParser(
        description="Extract git commits across all branches for one or more authors."
    )
    parser.add_argument(
        "-u", "--users",
        nargs="+",
        required=True,
        metavar="USERNAME",
        help="One or more author names/emails to filter by, e.g. -u vicky vickydecodes",
    )
    parser.add_argument(
        "-r", "--repo",
        default=".",
        help="Path to the git repository (default: current directory)",
    )
    parser.add_argument(
        "-f", "--file",
        default="commit_logs.txt",
        help="Output filename, overwritten each run (default: commit_logs.txt)",
    )
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    if not (repo / ".git").exists():
        print(f"Error: {repo} is not a git repository.", file=sys.stderr)
        sys.exit(1)

    branches = get_all_branches(repo)
    if not branches:
        print("No branches found.", file=sys.stderr)
        sys.exit(1)

    seen_hashes = set()
    lines_out = []

    for branch in branches:
        for line in get_commits_for_branch(repo, branch, args.users):
            commit_hash, author, date, subject = line.split("|", 3)
            if commit_hash in seen_hashes:
                continue  # same commit reachable from multiple branches
            seen_hashes.add(commit_hash)
            lines_out.append(f"[{branch}] {date} | {author} | {commit_hash[:8]} | {subject}")

    output_path = Path(args.file).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:  # "w" = overwrite, never append
        if lines_out:
            f.write("\n".join(lines_out) + "\n")
        else:
            f.write("No commits found for given users.\n")

    print(f"Extracted {len(lines_out)} commit(s) from {len(branches)} branch(es) -> {output_path}")


if __name__ == "__main__":
    main()