const fs = require("fs");
const dataPath = require("../../data/data_path");

class DataStore {
  constructor(dataFile) {
    this.dataFile = `${dataFile}/data.json`;
    this.getFile();
  }

  getFile() {
    try {
      if (!fs.existsSync(this.dataFile)) {
        fs.writeFileSync(this.dataFile, JSON.stringify({}));
      }
      const data = fs.readFileSync(this.dataFile);
      this.data = JSON.parse(data);
    } catch (e) {
      console.log(e);
    }
  }

  saveFile() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify(this.data));
    } catch (e) {
      console.log(e);
    }
  }

  insert(data) {
    var dt = {};
    data.map((d) => {
      const id = d._id;
      delete d._id;
      dt[id] = { ...d };
    });

    var bL = Object.keys(this.data).length;
    this.data = { ...dt, ...this.data };
    var aL = Object.keys(this.data).length;

    this.saveFile();

    return {
      insertedCount: aL - bL,
    };
  }

  update(data) {
    var dt = {};
    data.map((d) => {
      const id = d._id;
      delete d._id;
      dt[id] = { ...d };
    });

    this.data = { ...this.data, ...dt };

    this.saveFile();

    return {
      updatedCount: data.length,
    };
  }

  get() {
    var keys = Object.keys(this.data);
    return keys.map((key) => {
      return {
        _id: key,
        ...this.data[key],
      };
    });
  }

  filter(fn) {
    const data = this.get();
    return data.filter(fn);
  }

  delete(fn) {
    const data = this.get();
    const toDelete = data.filter(fn);
    toDelete.map((d) => {
      delete this.data[d._id];
    });
    this.saveFile();
    return {
      deletedCount: toDelete.length,
    };
  }
}

const data = new DataStore(dataPath);

module.exports = data;
