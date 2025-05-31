import { useState, useEffect } from "react";
import {
  Container,
  Button,
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import SchoolLogo from "../images/vsu-logo.png";
import axios from "axios";
import config from "../config";
import { format } from "date-fns";
import { amber } from "@mui/material/colors";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const QueueReport = () => {
  const { user } = useAuth();

  const [loggedInUser, setLoggedInUser] = useState([]);
  const [purposes, setPurposes] = useState([]);
  const [counts, setCounts] = useState({});
  const [reportType, setReportType] = useState("Daily");

  const today = format(new Date(), "yyyy-MM-dd");
  const time = format(new Date(), "HH:mm a");

  const getPast7Days = () => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) =>
      format(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() - i),
        "yyyy-MM-dd"
      )
    ).reverse();
  };

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/user/${user.User_ID}/${user.Role}`)
      .then((response) => {
        setLoggedInUser(response.data[0]);
      });
  }, []);

  useEffect(() => {
    if (loggedInUser && loggedInUser.Counter_ID) {
      axios
        .get(`${config.API_BASE_URL}/api/purposes/${loggedInUser.Counter_ID}`)
        .then((response) => {
          setPurposes(response.data);
        })
        .catch((error) => {
          console.error("API error:", error);
        });
    }
  }, [loggedInUser]);

  useEffect(() => {
    if (purposes.length > 0) {
      const fetchCounts = async () => {
        const newCounts = {};

        await Promise.all(
          purposes.map(async (purpose) => {
            const id = purpose.Purpose_ID;
            try {
              let waiting = 0;
              let completed = 0;
              let cancelled = 0;

              const datesToFetch =
                reportType === "Weekly" ? getPast7Days() : [today];

              await Promise.all(
                datesToFetch.map(async (date) => {
                  const [w, c, x] = await Promise.all([
                    axios.get(
                      `${config.API_BASE_URL}/api/queuelist/purpose/${id}/${date}/Waiting`
                    ),
                    axios.get(
                      `${config.API_BASE_URL}/api/queuelist/purpose/${id}/${date}/Completed`
                    ),
                    axios.get(
                      `${config.API_BASE_URL}/api/queuelist/purpose/${id}/${date}/Cancelled`
                    ),
                  ]);
                  waiting += w.data.length;
                  completed += c.data.length;
                  cancelled += x.data.length;
                })
              );

              newCounts[id] = {
                Waiting: waiting,
                Completed: completed,
                Cancelled: cancelled,
                Total: waiting + completed + cancelled,
              };
            } catch (error) {
              console.error(`Error fetching counts for purpose ${id}:`, error);
            }
          })
        );

        setCounts(newCounts);
      };

      fetchCounts();
    }
  }, [purposes, reportType]);

  const generatePDF = async () => {
    const input = document.getElementById("pdf-content");
    const canvas = await html2canvas(input, {
      scale: 3,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = imgProps.width;
    const imgHeight = imgProps.height;

    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgScaledWidth = imgWidth * ratio;
    const imgScaledHeight = imgHeight * ratio;
    const marginX = (pdfWidth - imgScaledWidth) / 2;

    pdf.addImage(imgData, "PNG", marginX, 0, imgScaledWidth, imgScaledHeight);
    pdf.save("queue-report.pdf");
  };

  const cellStyle = {
    border: "0.5px solid rgba(0, 0, 0, 0.1)",
    fontSize: "0.8rem",
    padding: "6px 8px",
  };

  const displayDate =
    reportType === "Weekly"
      ? `${format(
          new Date(getPast7Days().slice(-1)[0]),
          "MMMM d, yyyy"
        )} to ${format(new Date(getPast7Days()[0]), "MMMM d, yyyy")}`
      : `${format(new Date(), "MMMM d, yyyy")} - ${time}`;

  return (
    <Container maxWidth="sm">
      <Box
        mt={4}
        mb={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ maxWidth: "180mm", width: "100%" }}
      >
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="report-type-label">Report</InputLabel>
          <Select
            labelId="report-type-label"
            value={reportType}
            label="Report"
            onChange={(e) => setReportType(e.target.value)}
          >
            <MenuItem value="Daily">Daily</MenuItem>
            <MenuItem value="Weekly">Weekly</MenuItem>
          </Select>
        </FormControl>

        <Box display="flex" gap={2}>
          <Button variant="contained" color="success" onClick={generatePDF}>
            Export to PDF
          </Button>

          <Link to="/queuelist" style={{ textDecoration: "none" }}>
            <Button variant="contained" color="error">
              Cancel
            </Button>
          </Link>
        </Box>
      </Box>

      <Box
        id="pdf-content"
        component={Paper}
        p={2}
        mt={5}
        sx={{
          width: "180mm",
          maxWidth: "100%",
          backgroundColor: "white",
          color: "black",
          boxShadow: "none",
        }}
      >
        {/* Header */}
        <Box
          mb={5}
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{ borderBottom: "1px solid black", pb: 2 }}
        >
          <Box display="flex" alignItems="center">
            <Box
              component="img"
              src={SchoolLogo}
              alt="Logo"
              sx={{ height: 40, width: 40, mr: 1 }}
            />
            <Typography variant="subtitle1" fontWeight="bold">
              School Queueing Management System
            </Typography>
          </Box>
        </Box>

        {/* Meta Info */}
        <Grid container spacing={1} mb={5}>
          <Grid item xs={12}>
            <Typography variant="body2">
              Generated by:{" "}
              {(loggedInUser?.Staff_First_Name?.toUpperCase() || "") +
                " " +
                (loggedInUser?.Staff_Middle_Name
                  ? loggedInUser.Staff_Middle_Name.charAt(0).toUpperCase() +
                    ". "
                  : "") +
                (loggedInUser?.Staff_Last_Name?.toUpperCase() || "")}
            </Typography>
            <Typography variant="body2">
              Email: {loggedInUser?.Staff_Email_Address || "N/A"}
            </Typography>
            <Typography variant="body2">Date: {displayDate}</Typography>
          </Grid>
        </Grid>

        {/* Table */}
        <Table size="small" sx={{ borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow>
              {["Purpose", "Queued", "Served", "Cancelled", "Total"].map(
                (header) => (
                  <TableCell
                    key={header}
                    align={header === "Purpose" ? "left" : "right"}
                    sx={{
                      ...cellStyle,
                      backgroundColor: amber[500],
                      fontWeight: "bold",
                    }}
                  >
                    {header}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {purposes.map((purpose) => {
              const stats = counts[purpose.Purpose_ID] || {
                Waiting: "-",
                Completed: "-",
                Cancelled: "-",
                Total: "-",
              };

              return (
                <TableRow key={purpose.Purpose_ID}>
                  <TableCell sx={{ ...cellStyle, textAlign: "left" }}>
                    {purpose.Purpose_Description.toUpperCase()}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellStyle,
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {stats.Waiting}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellStyle,
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {stats.Completed}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellStyle,
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {stats.Cancelled}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellStyle,
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {stats.Total}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Container>
  );
};

export default QueueReport;
