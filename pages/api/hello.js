import axios from "axios";
import { parseString } from "xml2js";

const HELP_MESSAGE = "HELP";
const UNSUBSCRIBE_MESSAGE = "UNSUBSCRIBE";

const getMessageType = (message) => {
  if (message.toLowerCase()?.includes(["help"])) {
    return HELP_MESSAGE;
  } else if (
    ["stop", "end", "quit", "cancel", "unsubscribe"].includes(
      message.toLowerCase()
    )
  ) {
    return UNSUBSCRIBE_MESSAGE;
  }
};

const sendSMS = (phone_number, message) => {
  var data = `<?xml version="1.0" encoding="UTF-8"?>\n<mtMessage>\n    <destination address="${phone_number}" type="MDN" />\n    <source address="${process.env.VIBES_SHORT_CODE}" type="SC" />\n    <text>${message}</text>\n</mtMessage>`;

  var config = {
    method: "post",
    url: "https://messageapi.vibesapps.com/MessageApi/mt/messages",
    headers: {
      Authorization: `Basic ${process.env.VIBES_AUTH}`,
      "Content-Type": "application/xml",
    },
    data: data,
  };

  return axios(config);
};

const xmlToJS = (xml) =>
  new Promise((resolve, reject) => {
    parseString(xml, async (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });

const handler = async (request, response) => {
  const result = await xmlToJS(request.body);
  const { message, source } = result.moMessage;
  const sender = source?.[0]?.["$"].address;
  const MO = message?.[0];

  try {
    if (MO) {
      const messageToSend = getMessageType(MO);
      // messageToSend && (await sendSMS(sender, messageToSend));

      response.status(200).json({ message: "success", messageToSend });
    } else {
      response.status(500).json({ message: "error occurred" });
    }
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: "error occurred" });
  }
};

export default handler;
