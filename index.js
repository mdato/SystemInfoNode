const si = require("systeminformation");
const express = require("express");
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

// Función para limpiar los strings
const cleanString = (inputString) => {
  return inputString
    .replace(/est�ndar/g, 'estándard')  // Reemplaza el símbolo � por ñ, ajusta según sea necesario
    .replace(/gen�rico/g, 'genérico'); // Elimina o reemplaza otros caracteres según sea necesario
};

const getDataSystem = async () => {
  const graphics = await si.graphics();
  return {
    DataOS: await si.osInfo(),
    DataCPU: await si.cpu(),
    DataRAM: await si.mem(),
    DataGPU: {
      controller: graphics.controllers[0],
      display: graphics.displays[0]
    }
  };
};

app.get("/", async (req, res) => {
  try {
    const dataFull = await getDataSystem(); // Obtener los datos antes de enviar la respuesta

    // Limpieza de strings en las partes necesarias
    dataFull.DataGPU.controller.vendor = cleanString(dataFull.DataGPU.controller.vendor);
    dataFull.DataGPU.controller.model = cleanString(dataFull.DataGPU.controller.model);
    dataFull.DataGPU.display.vendor = cleanString(dataFull.DataGPU.display.vendor);
    dataFull.DataGPU.display.model = cleanString(dataFull.DataGPU.display.model);

    console.log("Data OS:", dataFull.DataOS);
    console.log("Data CPU:", dataFull.DataCPU);
    console.log("Data RAM:", dataFull.DataRAM);
    console.log("Data GPU:", dataFull.DataGPU);

    res.header('Content-Type', 'application/json; charset=utf-8'); // Asegurar que el encabezado está correctamente establecido
    res.json(dataFull); // Envía todos los datos obtenidos como respuesta
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => console.log(`Listening on port ${port}`));
