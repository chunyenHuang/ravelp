function search(){
  function target(name, location, stores, foundStores){
    for (var i=0; i<stores.length; i++){
      if (stores[i].name.toLowerCase().indexOf(name.toLowerCase()) != -1){
        foundStores.push(stores[i]);
      }
    }
    return foundStores;
  }
  return {
    target: target
  }
}

module.exports = search();
