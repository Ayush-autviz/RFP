import axios from "axios";
import { format } from "date-fns";

const BASE_URL = "http://localhost:8000";

export const fetchPdf = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/list-pdfs`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": "69420"
        },
      });
       return res.data
    } catch (error) {
      console.error('Error details:', error);
      throw error;
    }
};

export const createProject = async (name: string) => {
    const res = await axios.post(`${BASE_URL}/projects/?name=${encodeURIComponent(name)}`, {
        headers: {
            "ngrok-skip-browser-warning": "69420"
        }
    });
    return res.data;
};

export const getHistory = async ({filter,startDate,endDate,projectId}:{filter:string,startDate:string,endDate:string,projectId:string}) => {
    try {
      const params = new URLSearchParams();
      params.set("filter", filter);
      params.set("project_id", projectId);
      
      if (startDate && endDate) {
        params.set("start_date", format(startDate, "yyyy-MM-dd"));
        params.set("end_date", format(endDate, "yyyy-MM-dd"));
      }
      const res = await axios.get(`${BASE_URL}/chat-history/?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "ngrok-skip-browser-warning": "69420"
        },
      });
       return res.data
    } catch (error) {
      console.error('Error details:', error);
      throw error;
    }
};



export const UploadFiles = async (files:any)=>{
    try {
        const formData = new FormData();
        files.forEach((file:any) => {
            formData.append("files", file);
        });
        const response = await axios.post(`${BASE_URL}/upload-files`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "ngrok-skip-browser-warning": "69420"
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
}

export const DeletePdf = async (fileName: string) => {
    try {
        const res = await axios.delete(`${BASE_URL}/delete-file`, {
            data: { file_names: [fileName] }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};

type questions={
    file_names:[],
    user_query:String,
    use_rag :boolean
}

export const uploadQuestions = async (questions:questions) => {
    try {
        const res = await axios.post(`${BASE_URL}/generate-response`, {
           ...questions
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};

// New functions added below:

export const deleteProject = async (projectId: number) => {
    try {
        const res = await axios.delete(`${BASE_URL}/project-delete/?project_id=${projectId}`, {
            headers: {
                "ngrok-skip-browser-warning": "69420"
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};

export const getProjects = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/get-projects/`, {
            headers: {
                "ngrok-skip-browser-warning": "69420"
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};

export const getChats = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/get-chat-sessions`, {
            headers: {
                "ngrok-skip-browser-warning": "69420"
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};

export const uploadFilesWithProject = async (files: any[], projectId: number) => {
    try {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file);
        });
        formData.append("project_id", projectId.toString());
        
        const response = await axios.post(`${BASE_URL}/upload-files/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                "ngrok-skip-browser-warning": "69420"
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};

export const listFiles = async (projectId: number) => {
    try {
        const res = await axios.get(`${BASE_URL}/list-files/?project_id=${projectId}`, {
            headers: {
                "ngrok-skip-browser-warning": "69420"
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};

export const uploadKnowledgeBase = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('files', file);
    });
    
    const res = await axios.post(`${BASE_URL}/upload-knowledge/`, formData, {
        headers: {
            "ngrok-skip-browser-warning": "69420",
            "Content-Type": "multipart/form-data"
        }
    });
    return res.data;
};

export const generateResponse = async (userQuery: string, projectId: number) => {
    try {
        const res = await axios.post(`${BASE_URL}/generate-response/`, {
            user_query: userQuery,
            project_id: projectId,
        }, {
            headers: {
                "ngrok-skip-browser-warning": "69420"
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};

export const generatePreviousResponse = async (userQuery: string, projectId: number,chatId:string) => {
    try {
        const res = await axios.post(`${BASE_URL}/generate-response/`, {
            user_query: userQuery,
            project_id: projectId,
            chat_id:chatId
        }, {
            headers: {
                "ngrok-skip-browser-warning": "69420"
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};

export const generatePreviousOutline = async (userQuery: string, projectId: number,chatId:string) => {
    try {
        const res = await axios.post(`${BASE_URL}/plan-outline/`, {
            user_query: userQuery,
            project_id: projectId,
            chat_id:chatId
        }, {
            headers: {
                "ngrok-skip-browser-warning": "69420"
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};

export const generatePreviousAiDraft = async (userQuery: string, projectId: number,chatId:string) => {
    try {
        const res = await axios.post(`${BASE_URL}/ai-draft/`, {
            user_query: userQuery,
            project_id: projectId,
            chat_id:chatId
        }, {
            headers: {
                "ngrok-skip-browser-warning": "69420"
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};

export const deleteFile = async (projectId: number, fileId: number) => {
    try {
        const res = await axios.delete(`${BASE_URL}/file-delete/`, {
            data: {
                project_id: projectId,
                file_id: fileId
            },
            headers: {
                "ngrok-skip-browser-warning": "69420"
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};

export const ragChat = async (userQuery: string,chatId:number ,topResults: number) => {
    try {
        const res = await axios.post(`${BASE_URL}/rag-chat`, {
            user_query: userQuery,
            top_results: topResults,
            chat_session_id:chatId
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "ngrok-skip-browser-warning": "69420"
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};

export const getRagChatHistory = async (id:number) => {
    try {
        const res = await axios.get(`${BASE_URL}/rag-chat-history?session_id=${id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "ngrok-skip-browser-warning": "69420"
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};



export const getKnowledgeBase = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/list-vector-files`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "ngrok-skip-browser-warning": "69420"
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};

export const deleteChatQuestion = async (id:number) => {
    try {
        const res = await axios.delete(`${BASE_URL}/delete-chat?chat_id=${id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "ngrok-skip-browser-warning": "69420"
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};


export const deleteChatSession = async (id:number) => {
    try {
        const res = await axios.delete(`${BASE_URL}/delete-chat-session?session_id=${id}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "ngrok-skip-browser-warning": "69420"
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};

// Add to your APIservice file
export const deleteKnowledgeBaseFile = async (fileId: number) => {
    try {
        const res = await axios.delete(`${BASE_URL}/vector-file-delete?file_id=${fileId}`, {
            headers: {
                "ngrok-skip-browser-warning": "69420"
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error deleting knowledge base file:', error);
        throw error;
    }
};


export const generateOutline = async (userQuery: string, projectId: number) => {
    try {
        const res = await axios.post(`${BASE_URL}/plan-outline/`, {
            user_query: userQuery,
            project_id: projectId,
        }, {
            headers: {
                "ngrok-skip-browser-warning": "69420"
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};

export const generateAIdraft = async (userQuery: string, projectId: number) => {
    try {
        const res = await axios.post(`${BASE_URL}/ai-draft/`, {
            user_query: userQuery,
            project_id: projectId,
        }, {
            headers: {
                "ngrok-skip-browser-warning": "69420"
            }
        });
        return res.data;
    } catch (error) {
        console.error('Error details:', error);
        throw error;
    }
};


export const fetchPromptTypes = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/get-prompt-type/`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "ngrok-skip-browser-warning": "69420"
            },
        });
        return res.data;
    } catch (error) {
        console.error('Error fetching prompt types:', error);
        throw error;
    }
};

export const fetchPrompts = async (promptTypeId: number) => {
    try {
        const res = await axios.get(`${BASE_URL}/get-prompts/?prompt_type_id=${promptTypeId}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "ngrok-skip-browser-warning": "69420"
            },
        });
        return res.data;
    } catch (error) {
        console.error('Error fetching prompts:', error);
        throw error;
    }
};

export const updatePrompt = async ({
    prompt,
    promptTypeId,
    promptId,
}: {
    prompt: string;
    promptTypeId: number;
    promptId?: number;
}) => {
    try {
        const res = await axios.post(`${BASE_URL}/prompt/`, {
            prompt,
            prompt_type_id: promptTypeId,
            prompt_id: promptId,
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "ngrok-skip-browser-warning": "69420"
            },
        });
        return res.data;
    } catch (error) {
        console.error('Error updating prompt:', error);
        throw error;
    }
};

export const fetchSynopsis = async () => {
    try {
        const res = await axios.post(`${BASE_URL}/rfp-synopsis/`, {}, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "ngrok-skip-browser-warning": "69420"
            },
        });
        return res.data;
    } catch (error) {
        console.error('Error fetching RFP synopsis:', error);
        throw error;
    }
};

export const fetchCriticalDependencies = async () => {
    try {
        const res = await axios.post(`${BASE_URL}/critical-dependencies/`, {}, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "ngrok-skip-browser-warning": "69420"
            },
        });
        return res.data;
    } catch (error) {
        console.error('Error fetching critical dependencies:', error);
        throw error;
    }
};