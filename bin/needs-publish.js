const needsPublish = (packageName, version) => {
  return fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`)
    .then((res) => (res.ok ? res.json() : {}))
    .then((response) => !(version in response.time))
    .catch(() => true);
};

needsPublish(process.argv[2], process.argv[3]).then((needs) =>
  needs ? process.exit(0) : process.exit(1)
);
