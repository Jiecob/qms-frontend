import { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  Grid2,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { amber } from "@mui/material/colors";
import config from "../config";

const WindowPost = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [window, setWindow] = useState({
    Window_Number: "",
    Counter_ID: id,
  });

  const [windows, setWindows] = useState([]);

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/windows/` + id)
      .then(function (response) {
        console.log(response.data);
        setWindows(response.data);
      });
  }, []);

  const [error, setError] = useState("");

  const found = windows.find((obj) => {
    return (
      String(obj.Window_Number) === String(window.Window_Number) &&
      obj.Counter_ID == window.Counter_ID
    );
  });

  const handleChange = (event) => {
    const value = event.target.value;
    setWindow({
      ...window,
      [event.target.name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // console.log(window);
    // console.log(found);

    if (found) {
      setError("Window is already added!");
    } else {
      if (windows.length >= 5) {
        setError("Monitor cannot display more than 5 windows");
      } else {
        // console.log(window);
        axios
          .post(`${config.API_BASE_URL}/api/post/window`, window)
          .then(function (response) {
            // console.log(response.data);
            navigate("/windowlist/" + id);
            setError("");
          });
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          marginTop: 4,
          marginBottom: 4,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={"bold"}
          align="center"
          color="#424242"
          gutterBottom
        >
          Add Window
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            sx={{ "& input": { textTransform: "uppercase" } }}
            margin="normal"
            required
            fullWidth
            label="Window Number"
            type="number"
            name="Window_Number"
            onChange={handleChange}
          />
          {error && (
            <Typography sx={{ mt: 1 }} variant="h6" align="center" color="red">
              {error}
            </Typography>
          )}
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <Link
                to={"/windowlist/" + id}
                style={{ textDecoration: "none", color: "black" }}
              >
                <Button variant="contained" sx={{ mt: 2, mb: 2 }}>
                  Cancel
                </Button>
              </Link>
            </Grid2>
            <Grid2 size={8}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="success"
                sx={{ mt: 2, mb: 2 }}
              >
                Add
              </Button>
            </Grid2>
          </Grid2>
        </Box>
      </Paper>
    </Container>
  );
};

export default WindowPost;
