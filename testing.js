try{
  // function to check if the shift format is correct
  let checkShiftFormat = (shift) => {
    if (!shift) {
        return true;
    } else {
        let regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        return shift.length === 8 && regex.test(shift);
    }
};

  // if the shift format is correct, update the global calendar
  if (
      checkShiftFormat(time_1_start) &&
      checkShiftFormat(time_1_end) &&
      checkShiftFormat(time_2_start) &&
      checkShiftFormat(time_2_end) &&
      checkShiftFormat(time_3_start) &&
      checkShiftFormat(time_3_end)
  ) {
      // get global calendar row to update
      let globalCalendarRowToUpdate = Things["CIP.Database.Postgresql"].SQLQuery({
          query: "SELECT * FROM global_calendar WHERE global_calendar_uid = " +
          global_calendar_uid /* STRING */ ,
      });

      // get user calendar row to update
      let userCalendarRowToUpdate = Things["CIP.Database.Postgresql"].SQLQuery({
          query: "SELECT * FROM user_calendar WHERE global_calendar_uid = " +
          global_calendar_uid /* STRING */ ,
      });

      // get resource calendar row to update
      let resourceCalendarRowToUpdate = Things["CIP.Database.Postgresql"].SQLQuery({
          query: "SELECT * FROM resource_calendar WHERE global_calendar_uid = " +
          global_calendar_uid /* STRING */ ,
      });

      let monthToUpdate = globalCalendarRowToUpdate.month_number;
      let yearToUpdate = globalCalendarRowToUpdate.year;

      // check if the date is the last day of the year
      if (
          globalCalendarRowToUpdate.date_string.split("-")[1] === "12" &&
          globalCalendarRowToUpdate.date_string.split("-")[2] === "31"
      ) {
          yearToUpdate = globalCalendarRowToUpdate.year + 1;
          monthToUpdate = 1;
      }

      const longMonths = ["1", "3", "5", "7", "8", "10", "12"];
      const shortMonths = ["4", "6", "9", "11"];

      // check if the date is the last day of the month
      if (
          (longMonths.includes(globalCalendarRowToUpdate.month_number) &&
           globalCalendarRowToUpdate.day_number === "31") ||
          (shortMonths.includes(globalCalendarRowToUpdate.month_number) &&
           globalCalendarRowToUpdate.day_number === "30")
      ) {
          monthToUpdate = globalCalendarRowToUpdate.month_number + 1;
      }

      // logic for leap year
      if (
          globalCalendarRowToUpdate.month_number === "2" &&
          globalCalendarRowToUpdate.day_number === "29" &&
          ((globalCalendarRowToUpdate.year % 4 === 0 && globalCalendarRowToUpdate.year % 100 !== 0) ||
           globalCalendarRowToUpdate.year % 400 === 0)
      ) {
          monthToUpdate = 3;
      }

      // logic for non leap year
      if (
          globalCalendarRowToUpdate.month_number === "2" &&
          globalCalendarRowToUpdate.day_number === "28" &&
          !(
              (globalCalendarRowToUpdate.year % 4 === 0 && globalCalendarRowToUpdate.year % 100 !== 0) ||
              globalCalendarRowToUpdate.year % 400 === 0
          )
      ) {
          monthToUpdate = 3;
      }

      // update the global calendar
      Things["CIP.Database.Postgresql"].UpdateGlobalCalendar({
          global_calendar_UID: globalCalendarRowToUpdate.global_calendar_uid /* INTEGER */ ,
          year: globalCalendarRowToUpdate.year /* INTEGER */ ,
          month_number: globalCalendarRowToUpdate.month_number /* INTEGER */ ,
          date_string: globalCalendarRowToUpdate.date_string /* STRING */ ,
          day_total_number: globalCalendarRowToUpdate.day_total_number /* INTEGER */ ,
          month: globalCalendarRowToUpdate.month /* STRING */ ,
          day_number: globalCalendarRowToUpdate.day_number /* INTEGER */ ,
          week_number: globalCalendarRowToUpdate.week_number /* INTEGER */ ,
          day: globalCalendarRowToUpdate.day /* STRING */ ,

          // fields to update automaticaly
          working_day: time_1_start ? true : false /* BOOLEAN */ ,
          shifts: time_3_start ?
          3 :
          time_2_start ?
          2 :
          time_1_start ?
          1 :
          0 /* INTEGER */ ,
          comment: comment ? comment : globalCalendarRowToUpdate.comment /* STRING */ ,

          shift_1_start: time_1_start && new Date(
              globalCalendarRowToUpdate.year,
              globalCalendarRowToUpdate.month_number - 1,
              globalCalendarRowToUpdate.day_number,
              time_1_start.split(":")[0],
              time_1_start.split(":")[1],
              time_1_start.split(":")[2]
          ) /* DATETIME */ ,
          shift_1_end: time_1_end && new Date(
              globalCalendarRowToUpdate.year,
              globalCalendarRowToUpdate.month_number - 1,
              globalCalendarRowToUpdate.day_number,
              time_1_end.split(":")[0],
              time_1_end.split(":")[1],
              time_1_end.split(":")[2]
          ) /* DATETIME */ ,
          shift_2_start: time_2_start && new Date(
              globalCalendarRowToUpdate.year,
              globalCalendarRowToUpdate.month_number - 1,
              globalCalendarRowToUpdate.day_number,
              time_2_start.split(":")[0],
              time_2_start.split(":")[1],
              time_2_start.split(":")[2]
          ) /* DATETIME */ ,
          shift_2_end: time_2_end && new Date(
              globalCalendarRowToUpdate.year,
              globalCalendarRowToUpdate.month_number - 1,
              globalCalendarRowToUpdate.day_number,
              time_2_end.split(":")[0],
              time_2_end.split(":")[1],
              time_2_end.split(":")[2]
          ) /* DATETIME */ ,
          shift_3_start: time_3_start && new Date(
              globalCalendarRowToUpdate.year,
              globalCalendarRowToUpdate.month_number - 1,
              globalCalendarRowToUpdate.day_number,
              time_3_start.split(":")[0],
              time_3_start.split(":")[1],
              time_3_start.split(":")[2]
          ) /* DATETIME */ ,
          shift_3_end: time_3_end && new Date(
              yearToUpdate,
              monthToUpdate - 1,
              globalCalendarRowToUpdate.day_number + 1,
              time_3_end.split(":")[0],
              time_3_end.split(":")[1],
              time_3_end.split(":")[2]
          ) /* DATETIME */ ,
      });

      // update the users calendar if they exits
      if (userCalendarRowToUpdate.length > 0) {
        // Loop through each row
        for (let i = 0; i < userCalendarRowToUpdate.length; i++) {
          // Update the user calendar entry
          Things["CIP.Database.Postgresql"].UpdateUserCalendar({
            user_calendar_UID: userCalendarRowToUpdate[i].user_calendar_uid /* INTEGER */ ,
            justified_leave: userCalendarRowToUpdate[i].justified_leave /* BOOLEAN */ ,
            global_calendar_UID: global_calendar_uid /* INTEGER */ ,
            leave: userCalendarRowToUpdate[i].leave /* BOOLEAN */ ,
            shift1: userCalendarRowToUpdate[i].shift1 === true ? time_1_start ? true : false : userCalendarRowToUpdate[i].shift1 /* BOOLEAN */ ,
            shift2: userCalendarRowToUpdate[i].shift2 === true ? time_2_start ? true : false : userCalendarRowToUpdate[i].shift2 /* BOOLEAN */ ,
            shift3: userCalendarRowToUpdate[i].shift3 === true ? time_3_start ? true : false : userCalendarRowToUpdate[i].shift3 /* BOOLEAN */ ,
            comment: userCalendarRowToUpdate[i].comment /* STRING */ ,
            holiday: userCalendarRowToUpdate[i].holiday /* BOOLEAN */ ,
            username: userCalendarRowToUpdate[i].username /* STRING */
          });
        }
      }

     // update the resources calendar if they exits
     if (resourceCalendarRowToUpdate.length > 0) {
       // Loop through each row
         for(let i=0; i<resourceCalendarRowToUpdate.length; i++){
         Things["CIP.Database.Postgresql"].UpdateResourceCalendar({
           resource_calendar_UID: resourceCalendarRowToUpdate[i].resource_calendar_uid /* INTEGER */ ,
           global_calendar_UID: global_calendar_uid /* INTEGER */ ,
           resource: resourceCalendarRowToUpdate[i].resource /* STRING */ ,
           shift1: resourceCalendarRowToUpdate[i].shift1 === true ? time_1_start ? true : false : resourceCalendarRowToUpdate[i].shift1 /* BOOLEAN */ ,
           shift2: resourceCalendarRowToUpdate[i].shift2 === true ? time_2_start ? true : false : resourceCalendarRowToUpdate[i].shift2 /* BOOLEAN */ ,
           shift3: resourceCalendarRowToUpdate[i].shift3 === true ? time_3_start ? true : false : resourceCalendarRowToUpdate[i].shift3 /* BOOLEAN */ ,
           status: resourceCalendarRowToUpdate[i].status /* STRING */ ,
         });
       }
     }
  
      result = "Calendarios actualizado.";
  } else {
      result =
          "Campos de horas incorrectos! Seguir el modelo hh:mm:ss - ex: 10:20:30";
  }
}catch(error){
  result = "ERROR";
  Things["CIP.WorkOrders.Controller"].ErrorLog.AddRow({
      entity:"CIP.CalendarManager.Controller",
      resource:undefined,
      service:"updateGlobalCalendar",
      error:error,
      date:Date.now(),
      inputs:"time_1_start:"+time_1_start+",time_1_end:"+time_1_end+",time_2_start:"+time_2_start+",time_2_end:"+time_2_end+",time_3_start:"+time_3_start+",time_3_end:"+time_3_end+",global_calendar_uid:"+global_calendar_uid+",comment:"+comment
  });
}