# Comment on PR via GitHub Action

Original repo: https://github.com/unsplash/comment-on-pr

A GitHub action to comment on the relevant open PR when a commit is pushed.

## Usage

- Requires the `GITHUB_TOKEN` secret.
- Requires the comment's message in the `msg` parameter.
- Supports `push` and `pull_request` event types.

### Sample workflow

```yaml
name: comment-on-pr example
on: pull_request
jobs:
  example:
    name: sample comment
    runs-on: ubuntu-latest
    steps:
      - name: comment PR
        uses: unsplash/comment-on-pr@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          msg: 'Check out this message!'
          check_for_duplicate_msg: false # OPTIONAL
```
