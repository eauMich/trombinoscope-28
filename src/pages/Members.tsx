import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTeam } from "@/context/TeamContext";
import MemberCard from "@/components/ui/MemberCard";
import { PlusCircle, Search, Filter } from "lucide-react";

const Members: React.FC = () => {
  const { teamMembers } = useTeam();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [filteredMembers, setFilteredMembers] = useState(teamMembers);

  // Get unique departments for filter
  const departments = [
    ...new Set(teamMembers.map((member) => member.department)),
  ];

  // Filter members based on search and department
  useEffect(() => {
    const filtered = teamMembers.filter((member) => {
      const matchesSearch =
        searchTerm === "" ||
        `${member.firstName} ${member.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment =
        departmentFilter === "" || member.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });

    setFilteredMembers(filtered);
  }, [teamMembers, searchTerm, departmentFilter]);

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold">Membres de l'équipe</h1>
        <Link
          to="/members/new"
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Ajouter un nouveau membre
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-border/60 p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher des membres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="md:w-64 relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full appearance-none pl-9 pr-8 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            >
              <option value="">Tous les départements</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Aucun membre trouvé correspondant à vos critères de recherche.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Members;
