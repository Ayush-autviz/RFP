import React, { useEffect, useState } from 'react';
import { Bell, Plus, Search, Settings, X, ChevronDown, Trash2, Upload } from "lucide-react";
import { cn } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteFile, deleteProject, fetchPdf, getProjects, listFiles, uploadFilesWithProject, uploadKnowledgeBase, getKnowledgeBase, deleteKnowledgeBaseFile, createProject } from '@/lib/APIservice';
import { toast } from 'sonner';
import { LoadingSpinner } from './LoadingSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import axios from 'axios';
import { useProject } from '@/app/projectContext';
import Link from 'next/link';

type Props = {
    sidebarOpen: boolean;
};

interface PdfFile {
    id: number;
    filename: string;
    project_id: number;
}

const BASE_URL = 'https://9b1a-112-196-96-42.ngrok-free.app';



function Sidebar({ sidebarOpen }: Props) {
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const { selectedProject, setSelectedProject } = useProject();
    const knowledgeInputRef = React.useRef<HTMLInputElement | null>(null);
    const [isKnowledgeBaseDialogOpen, setIsKnowledgeBaseDialogOpen] = useState(false);

    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const { data: Projects, isLoading: ProjectsLoading, error: ProjectError } = useQuery({ 
        queryKey: ['projectList'], 
        queryFn: getProjects 
    });

    const { data: knowledgeBaseFiles, isLoading: knowledgeBaseLoading } = useQuery({
        queryKey: ['knowledgeBaseFiles'],
        queryFn: getKnowledgeBase,
        enabled: isKnowledgeBaseDialogOpen
    });

    const { mutate: uploadKnowledgeMutation, isPending: uploadKnowledgePending } = useMutation({
        mutationFn: (files: File[]) => uploadKnowledgeBase(files),
        onSuccess: () => {
            toast.success('Knowledge base files uploaded successfully');
            queryClient.invalidateQueries({ queryKey: ['knowledgeBaseFiles'] });
            if (knowledgeInputRef.current) {
                knowledgeInputRef.current.value = "";
            }
            
        },
        onError: () => {
            toast.error('Failed to upload knowledge base files');
            if (knowledgeInputRef.current) {
                knowledgeInputRef.current.value = "";
            }
        },
    });

    const { mutate: deleteProjectMutation, isPending: deleteProjectPending } = useMutation({
        mutationFn: (projectId: number) => deleteProject(projectId),
        onSuccess: (data, variables) => {
            toast.success('Project deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['projectList'] });
            if (selectedProject?.id === variables) {
                setSelectedProject(null);
            }
        },
        onError: () => {
            toast.error('Failed to delete project');
        },
    });

    const { mutate: createProjectMutation, isPending: createPending } = useMutation({
        mutationFn: createProject,
        onSuccess: (data) => {
            toast.success('Project created successfully');
            queryClient.invalidateQueries({ queryKey: ['projectList'] });
            setIsCreateDialogOpen(false);
            setNewProjectName('');
            setSelectedProject({ id: data.id, name: newProjectName });
        },
        onError: () => {
            toast.error('Failed to create project');
        },
    });

    const { mutate: DeletePdf, isPending: deletePending } = useMutation({
        mutationFn: ({ projectId, fileId }: { projectId: number; fileId: number }) =>
            deleteFile(projectId, fileId),
        onSuccess: (_, variables) => {
            toast.success('File deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['projectFiles', variables.projectId] });
        },
        onError: () => {
            toast.error('Failed to delete file');
        },
    });

    const { mutate: uploadFilesMutation, isPending: uploadPending } = useMutation({
        mutationFn: ({ files, projectId }: { files: File[], projectId: number }) => 
            uploadFilesWithProject(files, projectId),
        onSuccess: () => {
            toast.success('Files uploaded successfully');
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            queryClient.invalidateQueries({ queryKey: ['projectFiles', selectedProject?.id] });
        },
        onError: () => {
            toast.error('Failed to upload files');
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        },
    });

    const { mutate: deleteKnowledgeBaseFileMutation, isPending: deleteKnowledgePending } = useMutation({
        mutationFn: (fileId: number) => deleteKnowledgeBaseFile(fileId),
        onSuccess: () => {
            toast.success('Knowledge base file deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['knowledgeBaseFiles'] });
        },
        onError: () => {
            toast.error('Failed to delete knowledge base file');
        },
    });

    const handleKnowledgeUploadClick = () => {
        if (knowledgeInputRef.current) {
            knowledgeInputRef.current.click();
        }
    };

    const handleDeleteProject = (projectId: number) => {
        deleteProjectMutation(projectId);
    };

    const handleCreateProject = () => {
        if (newProjectName.trim()) {
            createProjectMutation(newProjectName);
        }
    };

    const removeFile = (fileId: number, projectId: number) => {
        DeletePdf({ projectId, fileId }); 
    };

    const toggleProject = (projectId: number, projectName: string) => {
        if (selectedProject?.id === projectId) {
            setSelectedProject(null);
        } else {
            setSelectedProject({ id: projectId, name: projectName });
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, projectId: number) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0 && projectId) {
            uploadFilesMutation({ files, projectId });
        }
    };

    const handleKnowledgeFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            uploadKnowledgeMutation(files);
        }
    };

    return (
        <div className={cn(
            "min-w-[280px] max-w-[280px] bg-[#111827] text-white flex flex-col fixed md:static inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <Link href="/">
                    <h2 className="font-medium">Company Logo</h2>
                </Link>
                <Bell size={20} className="text-gray-400" />
            </div>

            {/* Project Dropdown List */}
            <div className="p-4 border-b border-gray-700">
                <div className='justify-between flex items-center mb-4'>
                    <h3 className="text-gray-300 ">Projects</h3>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant='ghost' onClick={() => setIsCreateDialogOpen(true)} className="flex items-center text-gray-300 rounded-full w-6 h-6 text-xs cursor-pointer">
                                <Plus size={16} className="" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Project</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <Input
                                    placeholder="Project Name"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                />
                                <Button 
                                    onClick={handleCreateProject}
                                    disabled={createPending || !newProjectName.trim()}
                                >
                                    {createPending ? <LoadingSpinner /> : 'Create'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                
                {deletePending || ProjectsLoading || deleteProjectPending ? (
                    <div className='flex justify-center items-center h-15'>
                        <LoadingSpinner />
                    </div>
                ) : Projects?.projects?.length > 0 ? (
                    Projects.projects.map((project: any, index: number) => (
                        <div key={index} className="mb-2">
                            <div className="bg-[#1a2234] p-2 text-xs flex items-center justify-between text-gray-300 rounded">
                                <div 
                                    className="flex items-center flex-1 cursor-pointer"
                                    onClick={() => toggleProject(project.id, project.name)}
                                >
                                    <p className='truncate mr-2'>{project.name}</p>
                                    <ChevronDown 
                                        size={16} 
                                        className={cn(
                                            "text-gray-400 flex-shrink-0 transition-transform",
                                            selectedProject?.id === project.id ? "rotate-180" : ""
                                        )} 
                                    />
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Trash2 
                                            size={16} 
                                            className="text-gray-400 cursor-pointer hover:text-red-400 ml-2"
                                        />
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the project
                                                and all associated files.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                                onClick={() => handleDeleteProject(project.id)}
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                            {selectedProject?.id === project.id && (
                                <div className="pl-4 pt-2">
                                    <ProjectFiles 
                                        projectId={project.id} 
                                        removeFile={removeFile} 
                                    />
                                    <div className='pl-4'>
                                        <Button variant='ghost' onClick={handleUploadClick} className="flex items-center text-gray-300 w-full text-xs cursor-pointer mt-2">
                                            {uploadPending ? <LoadingSpinner /> :<Upload size={16} className="mr-2" /> }
                                            Upload Files
                                            <input
                                                type="file"
                                                multiple
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={(e) => handleFileUpload(e, project.id)}
                                                disabled={uploadPending}
                                            />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-sm">No projects available</p>
                )}
            </div>



            <nav className="flex-1 p-4">
                <ul className="space-y-6">
                    <Link href={"/depend"} className="flex items-center">
                        <div className="w-6 h-6 mr-2 flex items-center justify-center rounded">
                            <span className="text-xs">📄</span>
                        </div>
                        Synopsis
                    </Link>
                    <Link href={"/depend"} className="flex items-center">
                        <div className="w-6 h-6 mr-2 flex items-center justify-center rounded">
                            <span className="text-xs">🚩</span>
                        </div>
                        Red Flags / Dependencies
                    </Link>
                    <Link href={"/"} className="flex items-center">
                        <div className="w-6 h-6 mr-2 flex items-center justify-center rounded">
                            <span className="text-xs">📄</span>
                        </div>
                        Prepare Response
                    </Link>
                    <Link href={"ragChat"} className="flex items-center">
                        <div className="w-6 h-6 mr-2 flex items-center justify-center rounded">
                            <Search size={16} />
                        </div>
                        Search in KMS
                    </Link>
                </ul>
            </nav>

            <div className="p-4 border-b border-gray-700 mt-auto">
                <Link href={"/promptManagement"}>
               <Button 
                    variant='ghost' 
                    className="flex items-center text-gray-300 w-full text-sm cursor-pointer mb-2"
                >
                    Prompt Management
                </Button>
                </Link>
                <Button 
                    variant='ghost' 
                    onClick={handleKnowledgeUploadClick} 
                    className="flex items-center text-gray-300 w-full text-sm cursor-pointer mb-2"
                >
                    {uploadKnowledgePending ? (
                        <LoadingSpinner />
                    ) : (
                        <Upload size={18} className="mr-2" />
                    )}
                    Upload Knowledge Base
                    <input
                        type="file"
                        multiple
                        ref={knowledgeInputRef}
                        className="hidden"
                        onChange={handleKnowledgeFileUpload}
                        disabled={uploadKnowledgePending}
                    />
                </Button>

                <Dialog open={isKnowledgeBaseDialogOpen} onOpenChange={setIsKnowledgeBaseDialogOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            variant='ghost' 
                            className="flex items-center text-gray-300 w-full text-sm cursor-pointer"
                        >
                            <Settings size={18} className="mr-2" />
                            Edit Knowledge Base
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Knowledge Base Files</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 max-h-[60vh] overflow-y-auto">
                            {knowledgeBaseLoading ? (
                                <div className="flex justify-center items-center h-32">
                                    <LoadingSpinner />
                                </div>
                            ) : knowledgeBaseFiles?.result?.length > 0 ? (
                                <div className="space-y-2">
                                    {knowledgeBaseFiles.result.map((file: any) => (
                                        <div 
                                            key={file.id}
                                            className="flex items-center justify-between bg-gray-800 p-3 rounded-md"
                                        >
                                            <p className="text-gray-200 text-sm truncate mr-2">
                                                {file.filename}
                                            </p>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={deleteKnowledgePending}
                                                        className="text-red-400 hover:text-red-500"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete File</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete {file.filename}? 
                                                            This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => deleteKnowledgeBaseFileMutation(file.id)}
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm text-center">
                                    No files in knowledge base
                                </p>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>


        </div>
    );
}

interface ProjectFilesProps {
    projectId: number;
    removeFile: (fileId: number, projectId: number) => void;
}

function ProjectFiles({ projectId, removeFile }: ProjectFilesProps) {
    const { data: files, isLoading, error } = useQuery({
        queryKey: ['projectFiles', projectId],
        queryFn: () => listFiles(projectId),
    });

    if (isLoading) return <div className="pl-4 pt-2 flex justify-center items-center"><LoadingSpinner /></div>;
    if (error) return <div className="pl-4 pt-2 text-red-400 text-xs">Failed to load files</div>;

    return (
        <div className="pl-4 pt-2">
            {files?.files_list?.length > 0 ? (
                files?.files_list.map((file: PdfFile) => (
                    <div 
                        key={file.id} 
                        className="bg-[#1f2a44] p-2 text-xs flex items-center justify-between text-gray-300 rounded mb-1"
                    >
                        <p className='truncate mr-2'>{file?.filename}</p>
                        <X 
                            size={16} 
                            className="text-gray-400 flex-shrink-0 cursor-pointer" 
                            onClick={() => removeFile(file.id, file.project_id)} 
                        />
                    </div>
                ))
            ) : (
                <p className="text-gray-400 text-xs">No files in this project</p>
            )}
        </div>
    );
}

export default Sidebar;

