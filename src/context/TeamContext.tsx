import React, { createContext, useState, useEffect, useContext } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_TEAM_MEMBERS,
  GET_DEPARTMENTS,
  GET_LOCATIONS,
  CREATE_TEAM_MEMBER,
  UPDATE_TEAM_MEMBER,
  DELETE_TEAM_MEMBER,
  IMPORT_TEAM_MEMBERS,
} from "../api/graphql/queries";

// Types à adapter selon vos besoins actuels
interface TeamContextType {
  teamMembers: any[];
  departments: any[];
  locations: any[];
  loading: boolean;
  error: any;
  createTeamMember: (data: any) => Promise<any>;
  updateTeamMember: (id: number, data: any) => Promise<any>;
  deleteTeamMember: (id: number) => Promise<any>;
  importTeamMembers: (members: any[]) => Promise<any>;
  getTeamMember: (id: number) => any;
  getDirectReports: (managerId: number) => any[];
  importTeamMembersFromCSV: (csvText: string) => { imported: number };
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Récupération des données
  const {
    data: teamMembersData,
    loading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useQuery(GET_TEAM_MEMBERS);
  const { data: departmentsData, loading: deptsLoading } =
    useQuery(GET_DEPARTMENTS);
  const { data: locationsData, loading: locsLoading } = useQuery(GET_LOCATIONS);

  // Mutations
  const [createTeamMemberMutation] = useMutation(CREATE_TEAM_MEMBER);
  const [updateTeamMemberMutation] = useMutation(UPDATE_TEAM_MEMBER);
  const [deleteTeamMemberMutation] = useMutation(DELETE_TEAM_MEMBER);
  const [importTeamMembersMutation] = useMutation(IMPORT_TEAM_MEMBERS);

  // États locaux pour le cache optimiste
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Mise à jour des états locaux quand les données GraphQL sont chargées
  useEffect(() => {
    if (teamMembersData?.teamMembers) {
      setTeamMembers(teamMembersData.teamMembers);
    }
    if (departmentsData?.departments) {
      setDepartments(departmentsData.departments);
    }
    if (locationsData?.locations) {
      setLocations(locationsData.locations);
    }
  }, [teamMembersData, departmentsData, locationsData]);

  // Fonctions d'interaction avec l'API
  const createTeamMember = async (data: any) => {
    try {
      const { data: result } = await createTeamMemberMutation({
        variables: { data },
        refetchQueries: [{ query: GET_TEAM_MEMBERS }],
      });
      return result.createTeamMember;
    } catch (error) {
      console.error("Error creating team member:", error);
      throw error;
    }
  };

  const updateTeamMember = async (id: number, data: any) => {
    try {
      const { data: result } = await updateTeamMemberMutation({
        variables: { id, data },
        refetchQueries: [{ query: GET_TEAM_MEMBERS }],
      });
      return result.updateTeamMember;
    } catch (error) {
      console.error("Error updating team member:", error);
      throw error;
    }
  };

  const deleteTeamMember = async (id: number) => {
    try {
      const { data: result } = await deleteTeamMemberMutation({
        variables: { id },
        refetchQueries: [{ query: GET_TEAM_MEMBERS }],
      });
      return result.deleteTeamMember;
    } catch (error) {
      console.error("Error deleting team member:", error);
      throw error;
    }
  };

  const importTeamMembers = async (members: any[]) => {
    try {
      const { data: result } = await importTeamMembersMutation({
        variables: { members },
        refetchQueries: [{ query: GET_TEAM_MEMBERS }],
      });
      return result.importTeamMembers;
    } catch (error) {
      console.error("Error importing team members:", error);
      throw error;
    }
  };

  const importTeamMembersFromCSV = (csvText: string) => {
    try {
      // Analyser le CSV
      const lines = csvText.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      const members = [];

      // Parcourir chaque ligne (sauf l'en-tête)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Ignorer les lignes vides

        const values = line.split(",").map((v) => v.trim());
        const member: any = {};

        // Associer les valeurs aux noms de colonnes
        for (let j = 0; j < headers.length; j++) {
          let key = headers[j];
          let value = values[j];

          // Convertir les valeurs si nécessaire
          if (
            key === "departmentId" ||
            key === "locationId" ||
            key === "managerId"
          ) {
            value = value ? parseInt(value) : null;
          }

          member[key] = value;
        }

        members.push(member);
      }

      // Si des membres ont été trouvés, les importer
      if (members.length > 0) {
        importTeamMembers(members);
      }

      return { imported: members.length };
    } catch (error) {
      console.error("Error parsing CSV:", error);
      throw new Error("Failed to parse CSV file. Please check the format.");
    }
  };

  const getTeamMember = (id: number) => {
    return teamMembers.find((member) => member.id === id) || null;
  };

  const getDirectReports = (managerId: number) => {
    return teamMembers.filter((member) => member.managerId === managerId) || [];
  };

  const loading = membersLoading || deptsLoading || locsLoading;
  const error = membersError;

  return (
    <TeamContext.Provider
      value={{
        teamMembers,
        departments,
        locations,
        loading,
        error,
        createTeamMember,
        updateTeamMember,
        deleteTeamMember,
        importTeamMembers,
        getTeamMember,
        getDirectReports,
        importTeamMembersFromCSV,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
};
