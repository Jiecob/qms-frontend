import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid2,
  Box,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { QRCodeSVG } from "qrcode.react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import config from "../config";
import { Password } from "@mui/icons-material";

const CourseProfile = () => {
  const { id } = useParams();

  const { user } = useAuth();

  const navigate = useNavigate();

  const [course, setCourse] = useState([]);

  const [courses, setCourses] = useState([]);

  const [windows, setWindows] = useState([]);

  const [openSuccess, setOpenSuccess] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);

  const [error, setError] = useState("");

  let url;

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/courses`).then(function (response) {
      // console.log(response.data);
      setCourses(response.data);
    });
  }, []);

  useEffect(() => {
    axios.get(`${config.API_BASE_URL}/api/windows`).then(function (response) {
      // console.log(response.data);
      setWindows(response.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/course/` + id)
      .then(function (response) {
        // console.log(response.data[0]);
        setCourse(response.data[0]);
      });
  }, []);

  const found = courses.find((obj) => {
    return (
      obj.Course_ID !== course.Course_ID &&
      obj.Course_Code === course.Course_Code &&
      obj.Course_Description === course.Course_Description &&
      obj.Course_Major === course.Course_Major
    );
  });

  const handleChange = (event) => {
    const value = event.target.value;
    setCourse({
      ...course,
      [event.target.name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // console.log(course);

    if (course) {
      if (found) {
        setError(course.Course_Code.toUpperCase() + " duplicate entry!");
      } else {
        axios
          .put(`${config.API_BASE_URL}/api/put/course/` + id, course)
          .then(function (response) {
            // console.log(response.data);
            if (response.data.errno) {
              setOpenWarning(true);
            } else {
              setOpenSuccess(true);

              navigate("/courselist");
            }
          });
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 3,
          marginTop: 4,
          marginBottom: 4,
          // backgroundColor: "black",
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Grid2 container spacing={2} justifyContent="center">
            <Grid2 item size={12}>
              <TextField
                sx={{ "& input": { textTransform: "uppercase" } }}
                margin="normal"
                required
                fullWidth
                label="Course Code"
                type="text"
                name="Course_Code"
                value={course.Course_Code || ""}
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 item size={12}>
              <TextField
                sx={{ "& input": { textTransform: "uppercase" } }}
                margin="normal"
                required
                fullWidth
                label="Course Description"
                type="text"
                name="Course_Description"
                value={course.Course_Description || ""}
                onChange={handleChange}
              />
            </Grid2>
            <Grid2 item size={12}>
              <TextField
                sx={{ "& input": { textTransform: "uppercase" } }}
                margin="normal"
                fullWidth
                label="Course Major"
                type="text"
                name="Course_Major"
                value={course.Course_Major || ""}
                onChange={handleChange}
              />
            </Grid2>
            Choose a window for auto-suggestion during queue creation.
            <br></br>
            <br></br>
            <Grid2 item size={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel shrink htmlFor="window-select">
                  Window
                </InputLabel>
                <Select
                  labelId="window-label"
                  id="window-select"
                  value={course.Window_ID || ""}
                  name="Window_ID"
                  onChange={handleChange}
                  displayEmpty
                  label="Window"
                  sx={{ textAlign: "left" }}
                  MenuProps={{
                    PaperProps: { sx: { textAlign: "left" } },
                  }}
                  renderValue={(selected) => {
                    if (!selected) return "NONE";
                    const selectedWindow = windows.find(
                      (window) => window.Window_ID === selected
                    );
                    if (!selectedWindow) return "NONE";
                    return "WINDOW " + selectedWindow.Window_Number;
                  }}
                >
                  <MenuItem value={""}>NONE</MenuItem>
                  {windows.map((window, index) => (
                    <MenuItem key={index} value={window.Window_ID}>
                      {window.Assigned_Counter.toUpperCase() +
                        " - WINDOW " +
                        window.Window_Number}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>
          <br></br>

          {error && (
            <Typography sx={{ mt: 1 }} variant="h6" align="center" color="red">
              {error}
            </Typography>
          )}

          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              {user?.Role === "administrator" && (
                <Link
                  to="/courselist"
                  style={{ textDecoration: "none", color: "black" }}
                >
                  <Button variant="contained" sx={{ mt: 2, mb: 2 }}>
                    Cancel
                  </Button>
                </Link>
              )}
            </Grid2>
            <Grid2 size={8}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="success"
                startIcon={<SaveIcon />}
                sx={{ mt: 2, mb: 2 }}
              >
                Save
              </Button>
            </Grid2>
          </Grid2>
        </Box>
      </Paper>

      <Snackbar
        open={openSuccess}
        autoHideDuration={3000}
        onClose={() => setOpenSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setOpenSuccess(false)}>
          Updated Profile
        </Alert>
      </Snackbar>

      <Snackbar
        open={openWarning}
        autoHideDuration={5000}
        onClose={() => setOpenWarning(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="warning" onClose={() => setOpenWarning(false)}>
          Office ID is already used
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CourseProfile;
