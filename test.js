var somestring = "string value - depreciated";

function isDepreciated( S)
{
    var id = "Sun Mar 01 2015 11:24:05 GMT+00:00";
    var lastdepreciated = id.substr(-id.length , 24);
    console.log(lastdepreciated);
}

console.log('works');
isDepreciated(somestring);