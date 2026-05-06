Commit all staged changes, push to the current branch, and open a pull request.

Steps:
1. Run `git status` to show what will be committed.
2. Run `git diff --staged` to review the staged changes.
3. Write a commit message in conventional commit format (e.g. `feat:`, `fix:`, `chore:`, `refactor:`) based on what is staged.
4. Run `git commit -m "<message>"` with that commit message.
5. Run `git push origin <current-branch>` using the current branch name.
6. Run `gh pr create --fill --body "<commit-message>"` to open a pull request, using the commit message as the PR body.
