import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

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
    const URL = 'http://localhost:8080';

    const poll = new Poll({
      auto: false,
      factory: async () => {
        let response: Response;
        try {
          response = await fetch(URL);
        } catch (error) {
          console.log('Server is not up yet, retrying...');
          return;
        }

        if (!response.ok) {
          console.log('Response is not ok, retrying...');
          return;
        }
        // stop the poll
        alert('Server is up and running!');
        await poll.stop();
      },
      frequency: {
        interval: 5 * 1000, // every 5 seconds
        backoff: true,
        max: 300 * 1000
      },
      name: 'lumino-polling-example',
      standby: 'when-hidden'
    });

    // start the poll on plugin startup
    void poll.start();

    console.log('JupyterLab extension lumino-polling-example is activated!');
  }
};

export default plugin;
