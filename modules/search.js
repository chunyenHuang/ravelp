var _ = require('underscore');
function filterInt(value) {
  if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value)){
    return Number(value);
  }
  return NaN;
}

function search(){
  function target(name, location, stores, foundStores){
    var space = ' ';
    var searchNameArray = name.split(space);
    var searchLocationArray = location.split(space);
    var resultsNames = [];
    var resultsLocation = [];
    var resultsTags = [];
    var resultsDescriptions =[];

    // Search for exact name
    for (var i=0; i<stores.length; i++){
      var nameArray = stores[i].name.split(space);
      var lowerCases = [];
      for (var x=0; x<nameArray.length; x++){
        lowerCases.push(nameArray[x].toLowerCase());
      }
      lowerCases = lowerCases.join(' ');
      if (lowerCases.indexOf(name.toLowerCase()) != -1){
        resultsNames.push({id: stores[i].id, weight: 2});
      }
    }

    if (resultsNames.length == 0){
      // Search compare with Name
      for (var t=0; t<searchNameArray.length; t++){
        for (var i=0; i<stores.length; i++){
          var nameArray = stores[i].name.split(space);
          for (var x=0; x<nameArray.length; x++){
            if (nameArray[x].toLowerCase().indexOf(searchNameArray[t].toLowerCase()) != -1){
              resultsNames.push({id: stores[i].id, weight: 1});
            }
          }
        }
      }
      // Search Compare with brands
      for (var t=0; t<searchLocationArray.length; t++){
        for (var i=0; i<stores.length; i++){
          var locationArray = stores[i].address.split(space);
          for (var x=0; x<locationArray.length; x++){
            if (locationArray[x].toLowerCase().indexOf(searchLocationArray[t].toLowerCase()) != -1){
              resultsLocation.push({id: stores[i].id, weight: 0.7});
            }
          }
        }
      }
      // Search Compare with tag
      for (var t=0; t<searchNameArray.length; t++){
        for (var i=0; i<stores.length; i++){
          var tagsArray = stores[i].tags;
          for (var x=0; x<tagsArray.length; x++){
            if (tagsArray[x].toLowerCase().indexOf(searchNameArray[t].toLowerCase()) != -1){
              resultsTags.push({id: stores[i].id, weight: 0.3});
            }
          }
        }
      }
      // Search Compare with description
      for (var t=0; t<searchNameArray.length; t++){
        for (var i=0; i<stores.length; i++){
          var desArray = stores[i].description.split(space);
          for (var x=0; x<desArray.length; x++){
            if (desArray[x].toLowerCase().indexOf(searchNameArray[t].toLowerCase()) != -1){
              resultsDescriptions.push({id: stores[i].id, weight: 0.1});
            }
          }
        }
      }
    }
    var resultWeight = [];
    resultsNames = _.uniq(resultsNames, function(x){return x.id;});
    resultsLocation = _.uniq(resultsLocation, function(x){return x.id;});
    resultsTags = _.uniq(resultsTags, function(x){return x.id;});
    resultsDescriptions = _.uniq(resultsDescriptions, function(x){return x.id;});
    resultWeight.push(resultsNames);
    resultWeight.push(resultsLocation);
    resultWeight.push(resultsTags);
    resultWeight.push(resultsDescriptions);
    resultWeight = _.flatten(resultWeight, 1);
    resultWeight = _(resultWeight).groupBy('id');
    var addWeight = _.chain(resultWeight).map(function(num, key){
          return {
            id: key,
            weight: _(num).reduce(function(m, x){ return m+x.weight;},0)
          };
        }).sortBy('weight').value().reverse()

    for (var i=0; i<addWeight.length; i++){
      var found = _.where(stores, {id: filterInt(addWeight[i].id)});
      foundStores.push(found[0]);
    }

    // Print Result (Remove Duplicates)
    foundStores = _.uniq(foundStores);
    console.log(foundStores.length);
    return foundStores;
  }
  return {
    target: target
  }
}

module.exports = search();
