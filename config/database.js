if(process.env.NODE_ENV === 'production'){
  module.exports = {mongoURI: 'mongodb://Levent:lionmonkeyhead@ds231315.mlab.com:31315/workmate-prob'}
} else {
  module.exports =  {mongoURI : 'mongodb://localhost/workmate-dev'}
}