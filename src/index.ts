import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the lumino-polling-example extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'lumino-polling-example:plugin',
  description: 'A JupyterLab extension to demonstrate the Lumino Polling',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension lumino-polling-example is activated!');
  }
};

export default plugin;
