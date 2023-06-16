set -e

git checkout -f main
git pull

git branch -D chore/deps || true
git checkout -b chore/deps

rm pnpm-lock.yaml
pnpm i
pnpm up -Li
pnpm build && pnpm vitest run
pnpm changeset

git add .changeset

git commit -av

git push -u origin chore/deps --force
