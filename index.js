const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// set environment
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// listen for the app to be ready
app.on('ready', () => {
    // create main window
    mainWindow = new BrowserWindow({});

    // load html file into the window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file',
        slashes: true
    }));

    // quit app when closed
    mainWindow.on('closed', () => {
      app.quit();
    });


    // build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // insert menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow(){
  // create main window
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Shopping List Item'
  });

  // load html file into the window
  addWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'addWindow.html'),
      protocol: 'file',
      slashes: true
  }));

  // garbage collection handle
  addWindow.on('closed', () => {
    addWindow = null;
  });
}

// catch item:add
ipcMain.on('item:add', (e, item) => {
  // send to main window
  mainWindow.webContents.send('item:add', item);
  // close addWindow
  addWindow.close();
});



// create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                accelerator: process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N',
                click(){
                  createAddWindow()
                }
            },
            {
              label: 'Clear Items',
              click(){
                mainWindow.webContents.send('item:clear');
              }
            },
            {
              label: 'Quit',
              // platform check terinary operator with shortcut
              accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
              click(){
                app.quit();
              }
            }
      ]
    }
];

// fix for mac to hide electron menu
// if mac add empty objec to menu
if(process.platform == 'darwin')
{
  mainMenuTemplate.unshift({});
} 

// add developer tools if not in production
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer',
    submenu: [
      {
        label: 'Toggle Dev Tools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}