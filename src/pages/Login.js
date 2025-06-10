import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  Checkbox,
  FormControlLabel,
  Alert,
  InputAdornment,
  IconButton,
  InputLabel,
} from "@mui/material";
import SchoolLogo from "../images/new-vsu-logo.png";
import QueueLogo from "../images/queuing-logo.png";
import { amber } from "@mui/material/colors";
import { useAuth } from "../context/AuthContext";
import config from "../config";
import Person2Icon from "@mui/icons-material/Person2";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import KeyIcon from "@mui/icons-material/Key";

const Login = () => {
  const [user, setUser] = useState({
    Username: "",
    Password: "",
  });

  const { login } = useAuth();

  const [users, setUsers] = useState([]);

  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/users`).then(function (response) {
      // console.log(response.data);
      setUsers(response.data);
    });
  }, []);

  const handleChange = (event) => {
    const value = event.target.value;
    setUser({
      ...user,
      [event.target.name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const foundUser = users.find((obj) => {
      return obj.Username === user.Username && obj.Password === user.Password;
    });

    if (foundUser) {
      // console.log(foundUser);

      login(foundUser.User_ID, foundUser.Role);
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        color="primary"
        sx={{
          padding: 4,
          marginTop: 4,
          marginBottom: 4,
          borderRadius: 2,
          backgroundColor: amber[500],
        }}
      >
        <Box display="flex" justifyContent="center" mb={4}>
          <img src={SchoolLogo} alt="Logo" width="75" />
        </Box>
        <Typography
          variant="h4"
          fontWeight={"bold"}
          align="center"
          color="white"
          gutterBottom
        >
          WELCOME BACK
        </Typography>
        <Box display="flex" justifyContent="center" mb={0}>
          <img src={QueueLogo} alt="Logo" width="300" />
        </Box>

        {error && (
          <Alert sx={{ mt: 2, mb: 2 }} severity="warning">
            Invalid Username and Password
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            fullWidth
            label="Username / School ID"
            autoFocus
            type="text"
            name="Username"
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person2Icon sx={{ marginTop: -0.3 }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="normal"
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            name="Password"
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <KeyIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword
                        ? "hide the password"
                        : "display the password"
                    }
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Link
            style={{ textDecoration: "none", color: "#551a8b" }}
            active
            to="/forgotpassword"
          >
            Forgot password?
          </Link>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="success"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Box display="flex" justifyContent="center" mb={2}>
            Don't have an account? &nbsp;<Link to="/register"> Sign up</Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
