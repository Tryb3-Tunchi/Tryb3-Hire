const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = {
  createPipeline: async (jobDescription: string) => {
    const res = await fetch(`${API_URL}/api/pipelines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create pipeline");
    }
    return res.json();
  },

  getPipeline: async (id: string) => {
    const res = await fetch(`${API_URL}/api/pipelines/${id}`);
    if (!res.ok) throw new Error("Pipeline not found");
    return res.json();
  },

  getAllPipelines: async () => {
    const res = await fetch(`${API_URL}/api/pipelines`);
    if (!res.ok) throw new Error("Failed to fetch pipelines");
    return res.json();
  },

  approvePipeline: async (id: string) => {
    const res = await fetch(`${API_URL}/api/pipelines/${id}/approve`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Approval failed");
    return res.json();
  },

  sendScreeningMessage: async (candidateId: string, message: string) => {
    const res = await fetch(`${API_URL}/api/screening/${candidateId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error("Screening failed");
    return res.json();
  },
};
