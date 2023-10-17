import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ServerConnection } from '@jupyterlab/services';

import { Poll } from '@lumino/polling';

/**
 * Initialization data for the lumino-polling-example extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'lumino-polling-example:plugin',
  description: 'A JupyterLab extension to demonstrate the Lumino Polling',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    // TODO: use the URL of your server
    const URL = 'http://localhost:8000';

    const defaultSettings = ServerConnection.makeSettings();
    const poll = new Poll({
      auto: false,
      factory: async () => {
        const response = await ServerConnection.makeRequest(
          URL,
          {},
          defaultSettings
        );
        if (response.status === 200) {
          // stop the poll
          console.log('Server is up and running!');
          await poll.stop();
          return;
        }
        console.log('Server is not up yet, retrying...');
      },
      frequency: {
        interval: 10 * 1000,
        backoff: true,
        max: 300 * 1000
      },
      name: 'lumino-polling-example',
      standby: 'when-hidden'
    });

    // start the poll on plugin startup
    void poll.start();
  }
};

export default plugin;
