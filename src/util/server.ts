import app from './app';

const port: number = app.get("port");
const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});


// Handle the shutdown
['SIGINT', 'SIGTERM', 'SIGQUIT']
  .forEach(signal => process.on(signal, () => {
    server.close(() => {
      console.log('Server is gracefully shutting down.');
      process.exit(0);
    });
  }));

export default server;
