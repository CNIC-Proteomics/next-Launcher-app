import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';

const AppHeader = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="xxl">
      <Container className='app-header-container'>
        <Navbar.Brand href="/">
          {/* <img
            alt=""
            src="/img/logo.svg"
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{' '}next-Launcher */}
          next-Launcher
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="/datasets">Datasets</Nav.Link>
            <Nav.Link href="/workflows">Workflows</Nav.Link>
            {/* <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
            </NavDropdown> */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

// import React, { useState } from 'react';
// import {
//   MDBContainer,
//   MDBNavbar,
//   MDBNavbarBrand,
//   MDBNavbarToggler,
//   MDBIcon,
//   MDBNavbarNav,
//   MDBNavbarItem,
//   MDBNavbarLink,
//   // MDBBtn,
//   MDBDropdown,
//   MDBDropdownToggle,
//   MDBDropdownMenu,
//   MDBDropdownItem,
//   MDBCollapse,
//   // MDBTabs,
//   // MDBTabsItem,
//   // MDBTabsLink,
//   // MDBTabsContent,
//   // MDBTabsPane
// } from 'mdb-react-ui-kit';


// const AppHeader = () => {
//   const [openNavRight, setOpenNavRight] = useState(false);

//   // <MDBNavbar expand='lg' light bgColor='light'>
//   return (
//     <div className="app-header">
//     <MDBNavbar expand='lg' dark bgColor='black'>
//       <MDBContainer fluid>
//         <MDBNavbarBrand href=''>
//           <img
//               src='https://mdbootstrap.com/img/logo/mdb-transaprent-noshadows.webp'
//               height='30'
//               alt=''
//               loading='lazy'
//             />
//           Next-Launcher
//           </MDBNavbarBrand>

//         <MDBNavbarToggler
//           aria-controls='navbarSupportedContent'
//           aria-expanded='false'
//           aria-label='Toggle navigation'
//           onClick={() => setOpenNavRight(!openNavRight)}
//         >
//           <MDBIcon icon='bars' fas />
//         </MDBNavbarToggler>

//         <MDBCollapse navbar open={openNavRight}>
//           <MDBNavbarNav right fullWidth={false} className='mb-2 mb-lg-0'>
//             <MDBNavbarItem>
//               <MDBNavbarLink href='/workflows'>Workflows</MDBNavbarLink>
//             </MDBNavbarItem>
//             <MDBNavbarItem>
//               <MDBNavbarLink href='/datasets'>Datasets</MDBNavbarLink>
//             </MDBNavbarItem>

//             <MDBNavbarItem>
//               <MDBDropdown>
//                 <MDBDropdownToggle tag='a' className='nav-link'>
//                   User
//                 </MDBDropdownToggle>
//                 <MDBDropdownMenu>
//                   <MDBDropdownItem link>Your workflows</MDBDropdownItem>
//                   <MDBDropdownItem link>Your input data</MDBDropdownItem>
//                   <MDBDropdownItem link>Logout</MDBDropdownItem>
//                 </MDBDropdownMenu>
//               </MDBDropdown>
//             </MDBNavbarItem>
//           </MDBNavbarNav>

//           {/* <form className='d-flex input-group w-auto'>
//             <div className="md-form my-0">
//               <input className="form-control mr-sm-2" type="text" placeholder="Search" aria-label="Search" />
//             </div>
//           </form> */}

//         </MDBCollapse>
//       </MDBContainer>
//     </MDBNavbar>
//     </div>
//   );
// }


// const TabSections = () => {
//   const [iconsActive, setIconsActive] = useState('tab1');

//   const handleIconsClick = (value: string) => {
//     if (value === iconsActive) {
//       return;
//     }
//     setIconsActive(value);
//   };

//   return (
//     <>
//       <MDBTabs className='mb-3'>
//         <MDBTabsItem>
//           <MDBTabsLink onClick={() => handleIconsClick('tab1')} active={iconsActive === 'tab1'}>
//             <MDBIcon fas icon='chart-pie' className='me-2' />Pipelines</MDBTabsLink>
//         </MDBTabsItem>
//         <MDBTabsItem>
//           <MDBTabsLink onClick={() => handleIconsClick('tab2')} active={iconsActive === 'tab2'}>
//             <MDBIcon fas icon='chart-line' className='me-2' /> Subscriptions
//           </MDBTabsLink>
//         </MDBTabsItem>
//         <MDBTabsItem>
//           <MDBTabsLink onClick={() => handleIconsClick('tab3')} active={iconsActive === 'tab3'}>
//             <MDBIcon fas icon='cogs' className='me-2' /> Settings
//           </MDBTabsLink>
//         </MDBTabsItem>
//       </MDBTabs>

//       <MDBTabsContent>
//         <MDBTabsPane open={iconsActive === 'tab1'}>Tab 1 content</MDBTabsPane>
//         <MDBTabsPane open={iconsActive === 'tab2'}>Tab 2 content</MDBTabsPane>
//         <MDBTabsPane open={iconsActive === 'tab3'}>Tab 3 content</MDBTabsPane>
//       </MDBTabsContent>
//     </>
//   );
// }


export default AppHeader;