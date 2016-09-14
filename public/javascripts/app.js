;requirejs.config({
    baseUrl:'../javascripts',
    paths:{
        jquery:'jquery-2.2.1.min',
        knockout:'knockout'
    }
});

requirejs(['jquery','knockout'],function($,ko){
   console.log($('body'));
   console.log(ko);
});