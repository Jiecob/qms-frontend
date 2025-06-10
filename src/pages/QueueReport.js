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
} from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import SchoolLogo from "../images/new-vsu-logo.png";
import axios from "axios";
import config from "../config";
import { format, differenceInCalendarDays } from "date-fns";
import { amber } from "@mui/material/colors";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const QueueReport = () => {
  const { user } = useAuth();

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [purposes, setPurposes] = useState([]);
  const [counts, setCounts] = useState({});
  const [windows, setWindows] = useState([]);
  const [countsByWindow, setCountsByWindow] = useState({});
  const [headOfOffice, setHeadOfOffice] = useState(null);
  const [counterID, setCounterID] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(""); // NEW

  const getDateRangeLabel = (start, end) => {
    if (!start || !end) return "Select Date Range";
    const diff = differenceInCalendarDays(end, start);
    if (diff === 0) return "Daily";
    if (diff === 6) return "Weekly";
    if (diff >= 27 && diff <= 31) return "Monthly";
    if (diff >= 364 && diff <= 366) return "Yearly";
    return `${format(start, "MMMM d, yyyy")} - ${format(end, "MMMM d, yyyy")}`;
  };

  const date = new Date();
  const today = format(date, "MMMM d, yyyy, h:mm a");
  const displayDate = getDateRangeLabel(startDate, endDate);

  useEffect(() => {
    axios
      .get(`${config.API_BASE_URL}/api/user/${user.User_ID}/${user.Role}`)
      .then((response) => {
        setCounterID(response.data[0].Counter_ID);
        setLoggedInUser(response.data[0]);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, [user.User_ID, user.Role]);

  useEffect(() => {
    if (loggedInUser && loggedInUser.Counter_ID) {
      axios
        .get(`${config.API_BASE_URL}/api/purposes/${loggedInUser.Counter_ID}`)
        .then((response) => setPurposes(response.data))
        .catch((error) => console.error("API error:", error));
    }
  }, [loggedInUser]);

  useEffect(() => {
    if (counterID) {
      axios
        .get(`${config.API_BASE_URL}/api/windows/${counterID}`)
        .then((res) => setWindows(res.data))
        .catch((err) => console.error("Error fetching windows:", err));
    }
  }, [counterID]);

  useEffect(() => {
    if (counterID) {
      axios
        .get(`${config.API_BASE_URL}/api/staff/head/${counterID}`)
        .then((response) => setHeadOfOffice(response.data[0]))
        .catch((error) =>
          console.error("Error fetching head of office:", error)
        );
    }
  }, [counterID]);
  useEffect(() => {
    if (purposes.length > 0 && startDate && endDate) {
      const fetchCounts = async () => {
        const newCounts = {};
        await Promise.all(
          purposes.map(async (purpose) => {
            const id = purpose.Purpose_ID;
            try {
              const [c, x] = await Promise.all([
                axios.get(
                  `${config.API_BASE_URL}/api/queuelist/purpose/${id}/${format(
                    startDate,
                    "yyyy-MM-dd"
                  )}/${format(endDate, "yyyy-MM-dd")}/Completed`
                ),
                axios.get(
                  `${config.API_BASE_URL}/api/queuelist/purpose/${id}/${format(
                    startDate,
                    "yyyy-MM-dd"
                  )}/${format(endDate, "yyyy-MM-dd")}/Cancelled`
                ),
              ]);
              newCounts[id] = {
                Completed: c.data.length,
                Cancelled: x.data.length,
                Total: c.data.length + x.data.length,
              };
            } catch (error) {
              console.error(`Error fetching counts for purpose ${id}:`, error);
              newCounts[id] = {
                Completed: "-",
                Cancelled: "-",
                Total: "-",
              };
            }
          })
        );
        setCounts(newCounts);
      };
      fetchCounts();
    }
  }, [purposes, startDate, endDate]);

  useEffect(() => {
    if (counterID && startDate && endDate) {
      axios
        .get(
          `${
            config.API_BASE_URL
          }/api/queuelist/counts-by-window/${counterID}/${format(
            startDate,
            "yyyy-MM-dd"
          )}/${format(endDate, "yyyy-MM-dd")}`
        )
        .then((response) => setCountsByWindow(response.data))
        .catch((error) => {
          console.error("Error fetching counts by window:", error);
          setCountsByWindow({});
        });
    }
  }, [counterID, startDate, endDate]);

  const generatePDF = async () => {
    const input = document.getElementById("pdf-content");
    const canvas = await html2canvas(input, { scale: 3, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const ratio = Math.min(
      pdfWidth / imgProps.width,
      pdfHeight / imgProps.height
    );
    const imgScaledWidth = imgProps.width * ratio;
    const imgScaledHeight = imgProps.height * ratio;
    const marginX = (pdfWidth - imgScaledWidth) / 2;

    pdf.addImage(imgData, "PNG", marginX, 0, imgScaledWidth, imgScaledHeight);
    pdf.save("queue-report.pdf");
  };

  const cellStyle = {
    border: "0.5px solid rgba(0, 0, 0, 0.1)",
    fontSize: "0.8rem",
    padding: "6px 8px",
  };

  const getReportTitle = () => {
    const statusLabel =
      selectedStatus === "Completed"
        ? "Served"
        : selectedStatus === "Cancelled"
        ? "Cancelled"
        : "Total";

    if (!startDate || !endDate) return "Queue Report";

    return `Queue Report - ${displayDate} (${statusLabel} Transactions)`;
  };

  return (
    <Container>
      <Box mt={8} mb={2} sx={{ width: "750px", mx: "auto" }}>
        <Grid container spacing={2} alignItems="flex-end">
          {/* Date Range Picker */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Select Date Range
            </Typography>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              dateFormat="yyyy-MM-dd"
              maxDate={new Date()}
              isClearable={true}
              className="date-picker-input"
              wrapperClassName="date-picker-wrapper"
            />
          </Grid>

          {/* Status Selector */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle2" gutterBottom>
              Status
            </Typography>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "0.9rem",
                borderRadius: "4px",
              }}
            >
              <option value="">-- Select Status --</option>
              <option value="Completed">SERVED</option>
              <option value="Cancelled">CANCELLED</option>
              <option value="Total">TOTAL</option>
            </select>
          </Grid>

          {/* Buttons */}
          <Grid
            item
            xs={12}
            sm={12}
            md={5}
            display="flex"
            justifyContent="flex-end"
            gap={2}
          >
            <Button
              variant="contained"
              color="success"
              onClick={generatePDF}
              disabled={!startDate || !endDate}
            >
              Export to PDF
            </Button>
            <Link to="/queuelist" style={{ textDecoration: "none" }}>
              <Button variant="contained" color="error">
                Cancel
              </Button>
            </Link>
          </Grid>
        </Grid>
      </Box>

      <Box
        id="pdf-content"
        component={Paper}
        mt={5}
        sx={{
          backgroundColor: "white",
          color: "black",
          boxShadow: "none",
          width: "750px", // A4 width
          mx: "auto", // center horizontally
          px: 5, // padding inside
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
          <Box display="flex" alignItems="center" sx={{ mt: 4, mb: 2 }}>
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
            <Typography variant="body2">
              Office: {loggedInUser?.Assigned_Counter?.toUpperCase() || "N/A"}
            </Typography>
            {/* <Typography variant="body2">Date Range: {displayDate}</Typography> */}
            <Typography variant="body2">Date Created: {today}</Typography>
          </Grid>
        </Grid>

        {!selectedStatus && (
          <>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              align="center"
              sx={{ marginBottom: 5 }}
            >
              {getReportTitle()}
            </Typography>
            <Table size="small" sx={{ borderCollapse: "collapse" }}>
              <TableHead>
                <TableRow>
                  {["Transaction", "Served", "Cancelled", "Total"].map(
                    (header) => (
                      <TableCell
                        key={header}
                        align={header === "Transaction" ? "left" : "center"}
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
                  const displayValue = (value) => (value === 0 ? "-" : value);
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
                        {displayValue(stats.Completed)}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...cellStyle,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {displayValue(stats.Cancelled)}
                      </TableCell>
                      <TableCell
                        sx={{
                          ...cellStyle,
                          textAlign: "center",
                          fontWeight: "bold",
                        }}
                      >
                        {displayValue(stats.Total)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}

        {selectedStatus && (
          <>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              align="center"
              sx={{ marginBottom: 5 }}
            >
              {getReportTitle()}
            </Typography>
            <Table size="small" sx={{ borderCollapse: "collapse" }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      ...cellStyle,
                      backgroundColor: amber[500],
                      fontWeight: "bold",
                    }}
                  >
                    Transaction
                  </TableCell>
                  {windows.map((window) => (
                    <TableCell
                      key={window.Window_ID}
                      align="center"
                      sx={{
                        ...cellStyle,
                        backgroundColor: amber[500],
                        fontWeight: "bold",
                      }}
                    >
                      {`Window ${window.Window_Number}` ||
                        `Window ${window.Window_ID}`}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {purposes.map((purpose) => (
                  <TableRow key={purpose.Purpose_ID}>
                    <TableCell sx={{ ...cellStyle, textAlign: "left" }}>
                      {purpose.Purpose_Description.toUpperCase()}
                    </TableCell>
                    {windows.map((window) => {
                      const countsObj =
                        countsByWindow?.[purpose.Purpose_ID]?.[
                          window.Window_ID
                        ];
                      if (!countsObj)
                        return (
                          <TableCell
                            key={window.Window_ID}
                            align="center"
                            sx={{
                              ...cellStyle,
                              fontWeight: "bold",
                              width: "1.5rem",
                            }}
                          >
                            -
                          </TableCell>
                        );
                      let countValue;
                      if (selectedStatus === "Total") {
                        countValue =
                          (countsObj.Completed || 0) +
                          (countsObj.Cancelled || 0);
                      } else {
                        countValue = countsObj[selectedStatus] || 0;
                      }
                      return (
                        <TableCell
                          key={window.Window_ID}
                          align="center"
                          sx={{ ...cellStyle, fontWeight: "bold" }}
                        >
                          {countValue === 0 ? "-" : countValue}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        <Box mt={10} display="flex" flexDirection="column" alignItems="left">
          {/* Signature Line */}
          <Box mt={6} mb={1} width="30%" borderBottom="1px solid black" />

          {/* Name */}
          <Typography
            variant="body1"
            fontWeight="bold"
            gutterBottom
            sx={{ textTransform: "uppercase" }}
          >
            {headOfOffice
              ? `${headOfOffice.Staff_First_Name} ${
                  headOfOffice.Staff_Middle_Name
                    ? headOfOffice.Staff_Middle_Name.charAt(0) + ". "
                    : ""
                }${headOfOffice.Staff_Last_Name}`
              : "Loading..."}
          </Typography>

          {/* Title */}
          <Typography
            variant="body2"
            gutterBottom
            sx={{ textTransform: "uppercase", fontStyle: "italic" }}
          >
            Head of {headOfOffice?.Assigned_Counter}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default QueueReport;
