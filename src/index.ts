import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IFrame } from '@jupyterlab/apputils';

import { PromiseDelegate } from '@lumino/coreutils';

import { Poll } from '@lumino/polling';

/**
 * The command IDs used by the plugin.
 */
namespace CommandIDs {
  /**
   * Open the preview
   */
  export const openPreview = 'lumino-polling-example:preview';
}

class TestServer {
  constructor(options: { url: string; timeout?: number }) {
    const url = options.url;
    const timeout = options.timeout ?? 2 * 60 * 1000; // 2 minutes

    // instantiate the poll to check if the server is up
    this._poll = new Poll({
      auto: false,
      factory: async () => {
        const elapsed = Date.now() - this._pollStartTime;
        if (elapsed > timeout) {
          // stop the poll
          await this._poll.stop();
          // reject the promise
          this._ready.reject('Timeout');
        }

        let response: Response;
        try {
          response = await fetch(url);
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
        await this._poll.stop();
        this._ready.resolve(void 0);
      },
      frequency: {
        interval: 5 * 1000, // every 5 seconds
        backoff: true,
        max: 300 * 1000
      },
      name: 'lumino-polling-example',
      standby: 'when-hidden'
    });
  }

  async start() {
    // TODO: start server here

    // start polling the server
    this._pollStartTime = Date.now();
    void this._poll.start();
  }

  /**
   * Whether the server polling started
   */
  get pollStarted() {
    return this._pollStartTime > 0;
  }

  /**
   * Whether the server is ready
   */
  get ready() {
    return this._ready.promise;
  }

  private _pollStartTime = 0;
  private _poll: Poll;
  private _ready = new PromiseDelegate<void>();
}

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
    const timeout = 2 * 60 * 1000; // 2 minutes
    const server = new TestServer({ url: URL, timeout });
    const iframe = new IFrame({ sandbox: ['allow-scripts'] });
    iframe.url = URL;
    iframe.id = 'server-preview';
    iframe.title.label = 'Server Preview';
    iframe.title.closable = true;

    const { commands } = app;
    commands.addCommand(CommandIDs.openPreview, {
      label: 'Open Preview',
      execute: async () => {
        // this is executed every time a user clicks on the menu entry

        // do not do we are already polling the server
        if (server.pollStarted) {
          return;
        }

        await server.start();

        server.ready
          .then(() => {
            // the server is ready, open the preview
            app.shell.add(iframe, 'main', { mode: 'split-right' });
          })
          .catch(reason => {
            // handle the case when the server is not ready after the timeout
            alert(`Could not start the server: ${reason}}`);
          });
      }
    });

    console.log('JupyterLab extension lumino-polling-example is activated!');
  }
};

export default plugin;
