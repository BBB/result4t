const needsPublish = (packageName, version) => {
  return fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`)
    .then((res) => {
      console.log(res.status);
      return res.ok ? res.json() : {};
    })
    .then((response) => {
      console.log({ response });
      return !(version in response.versions);
    })
    .catch(() => true);
};

needsPublish(process.argv[2], process.argv[3]).then((needs) =>
  needs ? process.exit(0) : process.exit(1)
);
