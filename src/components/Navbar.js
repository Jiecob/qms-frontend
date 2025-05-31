import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
  ListItemIcon,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { amber, grey } from "@mui/material/colors";
import SchoolLogo from "../images/vsu-logo.png";
import { useAuth } from "../context/AuthContext";
import QueueIcon from "@mui/icons-material/Queue";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import BusinessIcon from "@mui/icons-material/Business";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import LogoutIcon from "@mui/icons-material/Logout";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BadgeIcon from "@mui/icons-material/Badge";
import axios from "axios";
import config from "../config";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const [loggedInUser, setLoggedInUser] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/user/${user.User_ID}/${user.Role}`)
      .then((response) => {
        setLoggedInUser(response.data[0]);
      });
  }, []);

  return (
    <AppBar position="static" sx={{ background: amber[500] }}>
      <Toolbar>
        {/* Logo */}
        <Box sx={{ height: 40, width: 40, marginRight: 1 }}>
          <Link to="/queuelist">
            <img src={SchoolLogo} alt="Logo" style={{ height: 35 }} />
          </Link>
        </Box>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
          School Queueing Management System
        </Typography>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
          {user.Role !== "student" && user.Role !== "administrator" && (
            <Button
              sx={{ color: grey[800], fontWeight: "bold" }}
              component={Link}
              to="/dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              Dashboard
            </Button>
          )}

          <Button
            sx={{ color: grey[800], fontWeight: "bold" }}
            component={Link}
            to="/queuelist"
          >
            Queue
          </Button>

          {/* Dropdown User Menu */}
          <Box>
            <Button
              sx={{
                color: "#fff",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                textTransform: "UpperCase",
              }}
              onClick={handleMenuClick}
            >
              {loggedInUser?.Staff_First_Name ||
                loggedInUser?.First_Name ||
                "Administrator"}
              <ArrowDropDownIcon
                sx={{
                  ml: 0.5,
                  transition: "transform 0.2s ease",
                  transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              {/* <MenuItem disabled sx={{ opacity: 1 }}>
                {loggedInUser?.Assigned_Counter.toUpperCase() +
                  "'S " +
                  loggedInUser?.Staff_Position.toUpperCase()}
              </MenuItem> */}

              {(user.Role === "administrator" ||
                loggedInUser.Staff_Position === "head") && (
                <MenuItem
                  sx={{ color: grey[800] }}
                  component={Link}
                  to="/stafflist"
                >
                  <ListItemIcon>
                    <PeopleIcon fontSize="small" />
                  </ListItemIcon>
                  Staffs
                </MenuItem>
              )}
              {user.Role === "student" && (
                <MenuItem
                  sx={{ color: grey[800] }}
                  component={Link}
                  to={`/studentprofile/${loggedInUser.Student_ID}`}
                >
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
              )}
              {user.Role === "administrator" && (
                <div>
                  <MenuItem
                    sx={{ color: grey[800] }}
                    component={Link}
                    to="/studentlist"
                  >
                    <ListItemIcon>
                      <SchoolIcon fontSize="small" />
                    </ListItemIcon>
                    Students
                  </MenuItem>
                  <MenuItem
                    sx={{ color: grey[800] }}
                    component={Link}
                    to="/courselist"
                  >
                    <ListItemIcon>
                      <MenuBookIcon fontSize="small" />
                    </ListItemIcon>
                    Courses
                  </MenuItem>
                  <MenuItem
                    sx={{ color: grey[800] }}
                    component={Link}
                    to="/officelist"
                  >
                    <ListItemIcon>
                      <BusinessIcon fontSize="small" />
                    </ListItemIcon>
                    Offices
                  </MenuItem>
                </div>
              )}
              {(user.Role === "administrator" ||
                user.Role === "student" ||
                loggedInUser.Staff_Position === "head") && (
                <Divider sx={{ mb: 1, mt: 1 }} />
              )}
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Mobile Menu Icon */}
        <IconButton
          color="inherit"
          edge="end"
          onClick={handleDrawerToggle}
          sx={{ display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { md: "none" },
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            backgroundColor: amber[500],
          },
        }}
      >
        <List sx={{ width: 250 }}>
          {user.Role !== "student" && user.Role !== "administrator" && (
            <ListItem
              component={Link}
              button
              to="/dashboard"
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText
                sx={{ textDecoration: "none", color: "black" }}
                primary="Dashboard"
              />
            </ListItem>
          )}
          <ListItem
            component={Link}
            button
            to="/queuelist"
            onClick={handleDrawerToggle}
          >
            <ListItemIcon>
              <QueueIcon />
            </ListItemIcon>
            <ListItemText
              sx={{ textDecoration: "none", color: "black" }}
              primary="Queue"
            />
          </ListItem>

          {user.Role === "student" && (
            <ListItem
              component={Link}
              button
              to={"/studentprofile/" + loggedInUser.Student_ID}
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>
                <BadgeIcon />
              </ListItemIcon>
              <ListItemText
                sx={{ textDecoration: "none", color: "black" }}
                primary="Profile"
              />
            </ListItem>
          )}

          {user.Role === "administrator" && (
            <>
              <ListItem
                component={Link}
                button
                to="/courselist"
                onClick={handleDrawerToggle}
              >
                <ListItemIcon>
                  <MenuBookIcon />
                </ListItemIcon>
                <ListItemText
                  sx={{ textDecoration: "none", color: "black" }}
                  primary="Courses"
                />
              </ListItem>
            </>
          )}

          {user.Role === "administrator" && (
            <>
              <ListItem
                component={Link}
                button
                to="/studentlist"
                onClick={handleDrawerToggle}
              >
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText
                  sx={{ textDecoration: "none", color: "black" }}
                  primary="Students"
                />
              </ListItem>
            </>
          )}

          {(user.Role === "administrator" ||
            loggedInUser.Staff_Position === "head") && (
            <>
              <ListItem
                component={Link}
                button
                to="/stafflist"
                onClick={handleDrawerToggle}
              >
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText
                  sx={{ textDecoration: "none", color: "black" }}
                  primary="Staffs"
                />
              </ListItem>
            </>
          )}

          {user.Role === "administrator" && (
            <>
              <ListItem
                component={Link}
                button
                to="/officelist"
                onClick={handleDrawerToggle}
              >
                <ListItemIcon>
                  <BusinessIcon />
                </ListItemIcon>
                <ListItemText
                  sx={{ textDecoration: "none", color: "black" }}
                  primary="Offices"
                />
              </ListItem>
            </>
          )}

          <ListItem component={Link} button onClick={logout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              sx={{ textDecoration: "none", color: "black" }}
              primary="Sign Out"
            />
          </ListItem>
        </List>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
