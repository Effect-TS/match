import * as Glob from "glob";
import * as Fs from "node:fs";
import * as Path from "node:path";

const packages = ["."];
const topPkgJson = readJson("package.json");
const topName = topPkgJson.name;

packages.forEach((pkg) => {
  const pkgDir = Path.basename(pkg);
  const pkgJson = readJson(`${pkg}/package.json`);

  const entrypoints = pkgJson.preconstruct?.entrypoints ?? [];
  const resolvedEntrypoints = entrypoints
    .flatMap((_) => Glob.sync(Path.join(pkg, "src", _)))
    .map((_) => Path.relative(Path.join(pkg, "src"), _))
    .filter((_) => _ !== "index.ts");

  const modules = resolvedEntrypoints
    .map((_) => _.replace(/\.tsx?$/, ""))
    .sort();

  const files = genFiles(modules);
  const exports = genExports(topName, pkgDir, modules);

  writeGitignore(pkg, files);
  writeJson(`${pkg}/package.json`, {
    ...pkgJson,
    exports,
    files: ["src", ...files],
  });
});

updateVscodeIgnore();

function slugify(str) {
  return str.replace(/^@/g, "").replace(/\//g, "-");
}

function genExports(topName, pkgDir, modules) {
  const exportPrefix =
    pkgDir === "." ? slugify(topName) : `${topName}-${pkgDir}`;
  const exports = {
    ".": {
      types: "./dist/declarations/src/index.d.ts",
      module: `./dist/${exportPrefix}.esm.js`,
      import: `./dist/${exportPrefix}.cjs.mjs`,
      default: `./dist/${exportPrefix}.cjs.js`,
    },
    "./package.json": "./package.json",
  };
  modules.forEach((module) => {
    const moduleSafe = slugify(module);
    exports[`./${module}`] = {
      types: `./dist/declarations/src/${module}.d.ts`,
      module: `./${module}/dist/${exportPrefix}-${moduleSafe}.esm.js`,
      import: `./${module}/dist/${exportPrefix}-${moduleSafe}.cjs.mjs`,
      default: `./${module}/dist/${exportPrefix}-${moduleSafe}.cjs.js`,
    };
  });
  return exports;
}

function genFiles(modules) {
  return [
    "dist",
    "internal",
    ...modules
      .reduce((acc, file) => {
        const topLevel = file.split("/")[0];
        if (!acc.includes(topLevel)) {
          acc.push(topLevel);
        }
        return acc;
      }, [])
      .sort(),
  ];
}

function updateVscodeIgnore() {
  const settings = readJson(".vscode/settings.json");
  settings["files.exclude"] = packages
    .map((pkg) => Path.join(pkg, "package.json"))
    .map((file) => [Path.dirname(file), readJson(file)])
    .flatMap(
      ([dir, pkg]) =>
        pkg.files.filter((_) => _ !== "src").map((_) => [dir, _]) ?? []
    )
    .reduce((acc, [dir, file]) => {
      acc[Path.join(dir, file)] = true;
      return acc;
    }, {});
  writeJson(".vscode/settings.json", settings);
}

function readJson(file) {
  return JSON.parse(Fs.readFileSync(file, "utf8"));
}

function writeJson(file, content) {
  Fs.writeFileSync(file, JSON.stringify(content, null, 2) + "\n");
}

function writeGitignore(pkg, files) {
  Fs.writeFileSync(
    `${pkg}/.gitignore`,
    `coverage/
*.tsbuildinfo
node_modules/
yarn-error.log
.ultra.cache.json
.DS_Store
tmp/
build/
dist/
.direnv/

# files
${files.map((_) => `/${_}`).join("\n")}
`
  );
}
