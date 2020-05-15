import 'bootstrap';
import './scss/app.scss';

//not needed, if the script is loaded near the body-end html tag

// $( document ).ready(function() {
//     console.log( "ready!" );
// });

//alert("hi");
$(".app-root").html('<div class="inner-elemx" style="font-size: 100px; color:#ff0000; display: none">Hello World</div>');
$(".inner-elemx").show(5000);
