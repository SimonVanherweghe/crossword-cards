import { SerialPort } from "serialport";

const VENDOR_ID = "1a86";
const PRODUCT_ID = "7523";

let plotter;

const sendCommand = (plotter, command) => {
  console.log("[Plotter] Sending command:", command);
  plotter.write(command + "\r");
};

const findPlotter = async () => {
  const ports = await SerialPort.list();
  const hits = ports.filter(
    (port) => port.vendorId === VENDOR_ID && port.productId === PRODUCT_ID
  );
  if (hits.length > 0) {
    return hits[0];
  }
  return null;
};

const initPlotter = async () => {
  const port = await findPlotter();
  if (!port) console.log("No plotter found");
  console.log("path", port.path);
  plotter = await new SerialPort({ path: port.path, baudRate: 115200 });

  plotter.on("error", function (err) {
    console.log("Error: ", err.message);
  });

  console.log("[Plotter] Connected to plotter");
  return plotter;
};

const closePlotter = (plotter) => plotter.close();

const sendCommands = async (plotter, commands) => {
  commands = commands.filter((command) => command !== "");
  return new Promise((resolve) => {
    plotter.on("data", (data) => {
      console.log("[Plotter] Message received:", data.toString());

      if (data.toString().startsWith("ok")) {
        if (commands.length === 0) {
          resolve("No more commands to send");
        } else {
          sendCommand(plotter, commands.shift());
        }
      }
    });

    console.log("[Plotter] Let's go! Starting in 2 sec...");
    setTimeout(() => {
      if (commands.length > 0) {
        sendCommand(plotter, commands.shift());
      } else {
        resolve("No commands to send");
      }
    }, 2000);
  });
};

export { initPlotter, sendCommands, closePlotter };
