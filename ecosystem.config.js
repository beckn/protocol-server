module.exports = {
  apps: [
    {
      name: "Protocol-Server",
      script: "./dist/app.js",
      watch: false,
      instances: 3,
    },
  ],
};
