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

const PurposePost = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [purpose, setPurpose] = useState({
    Purpose_Description: "",
    Purpose_Type: "",
    Counter_ID: id,
  });

  const [purposes, setPurposes] = useState([]);

  const [windows, setWindows] = useState([]);

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/purposes/` + id)
      .then(function (response) {
        // console.log(response.data);
        setPurposes(response.data);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/windows/` + id)
      .then(function (response) {
        // console.log(response.data);
        setWindows(response.data);
      });
  }, []);

  const [error, setError] = useState("");

  const found = purposes.find((obj) => {
    return (
      obj.Purpose_Description === purpose.Purpose_Description &&
      obj.Purpose_Type === purpose.Purpose_Type
    );
  });

  const handleChange = (event) => {
    const value = event.target.value;
    setPurpose({
      ...purpose,
      [event.target.name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(purpose);

    if (found) {
      setError("Purpose is already added!");
    } else {
      axios
        .post(`${config.API_BASE_URL}/api/post/purpose`, purpose)
        .then(function (response) {
          // console.log(response.data);
          navigate("/purposelist/" + id);
          setError("");
        });
    }
  };

  return (
    <Container component="main" maxWidth="sm">
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
          Add Transaction
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            sx={{ "& input": { textTransform: "uppercase" } }}
            margin="normal"
            required
            fullWidth
            autoFocus
            label="Transaction Description"
            type="text"
            name="Purpose_Description"
            onChange={handleChange}
          />
          <TextField
            sx={{ "& input": { textTransform: "uppercase" } }}
            margin="normal"
            fullWidth
            label="Transaction Type"
            type="text"
            name="Purpose_Type"
            onChange={handleChange}
          />
          <Typography align="center" color="#424242" sx={{ mt: 2 }}>
            Choose a window for auto-suggestion during queue creation.
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="person-category-label">Window</InputLabel>
            <Select
              value={purpose.Window_ID || ""}
              name="Window_ID"
              label="Window"
              onChange={handleChange}
              sx={{ textAlign: "left" }} // Ensures text alignment
              MenuProps={{
                PaperProps: {
                  sx: {
                    textAlign: "left", // Also aligns dropdown items if needed
                  },
                },
              }}
            >
              {windows.map((window, index) => (
                <MenuItem key={index} value={window.Window_ID}>
                  {"WINDOW " + window.Window_Number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {error && (
            <Typography sx={{ mt: 1 }} variant="h6" align="center" color="red">
              {error}
            </Typography>
          )}
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <Link
                to={"/purposelist/" + id}
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

export default PurposePost;
