const csvtojson = require("csvtojson");
const mongoose = require("mongoose");
const mms = require("mongodb-memory-server");

const modelObjectIdKeys = [
  ['books', []],
  ['chapters', ['book']],
  ['characters', []],
  ['movies', []],
  ['quotes', ['movie', 'character']]
];

async function connectDb() {
  const mongoServer = await mms.MongoMemoryServer.create();

  return mongoose
    .connect(mongoServer.getUri(), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "lotr",
    })
    .then(async (client) => {
      console.log("Database Connected");

      // seed all models, while stripping
      // the `ObjectId(` prefix and `)` suffix away
      // from the key-value pairs that are of that format
      await Promise.all(modelObjectIdKeys.map(([model, keys]) => {
        const csvPath = `../db/csv/${model}.csv`;

        return csvtojson().fromFile(csvPath).then(source => {
          const toInsert = source.map(entry => {
            // every model has an _id key that needs to be parsed
            // (i.e. ObjectId(5cf5805fb53e011a64671582) => 5cf5805fb53e011a64671582)
            entry._id = entry._id.slice(9, -1);

            // and here are the rest... (if any)
            keys.forEach(k => {
              entry[k] = entry[k].slice(9, -1);
            });

            return entry;
          });

          client.models[model].insertMany(toInsert);
        });
      }));

      console.log("Database Seeded");

      return true;
    })
    .catch((err) => {
      console.log(`Could not connect: ${err}`);
      return false;
    });
}

exports.connectDb = connectDb;
