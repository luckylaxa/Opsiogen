export type EnquiryValues = {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  source: string;
  needs: string[];
};

export type EnquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: EnquiryValues;
};
