import React from "react";

const HealthPlan = () => {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", margin: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Personalized Health Plan</h1>
      <h2>Your BMI is: [BMI]</h2>

      {/* Diet Plan */}
      <h3>Diet Plan:</h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Meal</th>
            <th style={tableHeaderStyle}>Food</th>
            <th style={tableHeaderStyle}>Quantity (g)</th>
            <th style={tableHeaderStyle}>Calories</th>
          </tr>
        </thead>
        <tbody>
          {["Breakfast", "Lunch", "Dinner", "Snacks"].map((meal) => (
            <tr key={meal}>
              <td style={tableCellStyle}>{meal}</td>
              <td style={tableCellStyle}>[Food]</td>
              <td style={tableCellStyle}>[Quantity]</td>
              <td style={tableCellStyle}>[Calories]</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 1-Week Workout Plan */}
      <h3>1-Week Workout Plan:</h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Day</th>
            <th style={tableHeaderStyle}>Workout</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td style={tableCellStyle}>{i + 1}</td>
              <td style={tableCellStyle}>[Workout Details]</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Health Recommendations */}
      <h3>Health Recommendations:</h3>
      <p>[Your personalized health recommendations go here.]</p>
    </div>
  );
};

const tableHeaderStyle = {
  border: "1px solid black",
  padding: "10px",
  backgroundColor: "#f2f2f2",
  textAlign: "left",
};

const tableCellStyle = {
  border: "1px solid black",
  padding: "10px",
  textAlign: "left",
};

export default HealthPlan;
