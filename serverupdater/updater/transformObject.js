function transformObjects(arrayB) {
  let objectC = {};

  arrayB.forEach((objB) => {
    objectC[objB._id] = objB;
    delete objB._id;
  });

  return objectC;
}

module.exports = transformObjects;
