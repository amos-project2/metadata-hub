import 'bootstrap';
import './scss/app.scss';
import {Template} from "./template";


let template = new Template();
template.injectinDomeAndRegisterListener($(".app-root"));


// $(".app-root").html(`<div class="d-flex" id="wrapper">
//
//     <!-- Sidebar -->
//     <div class="bg-light border-right" id="sidebar-wrapper">
//       <div class="sidebar-heading">Start Bootstrap </div>
//       <div class="list-group list-group-flush">
//         <a href="#" class="list-group-item list-group-item-action bg-light nav-query">Query</a>
//         <a href="#" class="list-group-item list-group-item-action bg-light nav-graphiql">GraphIQl</a>
//         <a href="#" class="list-group-item list-group-item-action bg-light nav-crawler">Crawler</a>
//         <a href="#" class="list-group-item list-group-item-action bg-light nav-status">Status</a>
//         <a href="#" class="list-group-item list-group-item-action bg-light nav-logout">Logout</a>
//       </div>
//     </div>
//     <!-- /#sidebar-wrapper -->
//
//     <!-- Page Content -->
//     <div id="page-content-wrapper">
//
//       <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
//         <button class="btn btn-primary" id="menu-toggle">Toggle Menu</button>
//
//         <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
//           <span class="navbar-toggler-icon"></span>
//         </button>
//
//         <div class="collapse navbar-collapse" id="navbarSupportedContent">
//           <ul class="navbar-nav ml-auto mt-2 mt-lg-0">
//             <li class="nav-item active">
//               <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
//             </li>
//             <li class="nav-item">
//               <a class="nav-link" href="#">Link</a>
//             </li>
//             <li class="nav-item dropdown">
//               <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
//                 Dropdown
//               </a>
//               <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
//                 <a class="dropdown-item" href="#">Action</a>
//                 <a class="dropdown-item" href="#">Another action</a>
//                 <div class="dropdown-divider"></div>
//                 <a class="dropdown-item" href="#">Something else here</a>
//               </div>
//             </li>
//           </ul>
//         </div>
//       </nav>
//
//       <div class="container-fluid">
//         <h1 class="mt-4">Simple Sidebar</h1>
//         <p>The starting state of the menu will appear collapsed on smaller screens, and will appear non-collapsed on larger screens. When toggled using the button below, the menu will change.</p>
//         <p>Make sure to keep all page content within the <code>#page-content-wrapper</code>. The top navbar is optional, and just for demonstration. Just create an element with the <code>#menu-toggle</code> ID which will toggle the menu when clicked.</p>
//       </div>
//     </div>
//     <!-- /#page-content-wrapper -->
//
//   </div>
//   <!-- /#wrapper -->`);





