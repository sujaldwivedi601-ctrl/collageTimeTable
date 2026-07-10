# Project Architecture & Logic: Smart Tutor & Timetable Generator

This document contains the visual representations of the project's logic and data structure.

## 1. Project Workflow Flowchart
The following diagram illustrates the application flow, including user authentication and role-based dashboard redirection.

```mermaid
graph TD
    Start([Start]) --> UserAcc{User account?}
    
    UserAcc -- "No" --> Reg[Register Page]
    UserAcc -- "Yes" --> Login[Login Page]
    
    Reg --> Login
    Login --> Credentials[Check Credentials]
    
    Credentials --> IsAdmin{Is Admin?}
    
    IsAdmin -- "Yes" --> AdminDash[Admin Generator Dashboard]
    IsAdmin -- "No" --> UserDash[User Dashboard]
    
    AdminDash --> GenTT[Generate Timetable]
    AdminDash --> ChangeST[Manage Subjects/Teachers]
    
    UserDash --> ViewTT[View Saved Timetable]
    UserDash --> GenNewTT[Request New Timetable]
    
    GenTT --> End([End])
    ChangeST --> End
    ViewTT --> End
    GenNewTT --> End

    style Start fill:#f9f,stroke:#333,stroke-width:2px
    style End fill:#f9f,stroke:#333,stroke-width:2px
    style UserAcc fill:#fff4dd,stroke:#d4a017,stroke-width:2px
    style IsAdmin fill:#fff4dd,stroke:#d4a017,stroke-width:2px
    style AdminDash fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style UserDash fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
```

## 2. Entity Relationship (ER) Diagram
The diagram below uses **Chen Notation** — rectangles for entities, ovals for attributes, and diamonds for relationships.

```mermaid
graph TB

    %% ══════════════════════════════════════════════
    %% USER ACCOUNT — Entity + Attributes
    %% ══════════════════════════════════════════════
    UA_id(["<b><u>id</u></b>"]) --- UA["<b>User Account</b>"]
    UA_name(["User_name"]) --- UA
    UA_email(["email"]) --- UA
    UA_pass(["password"]) --- UA
    UA_role(["role"]) --- UA
    UA_inst(["institution"]) --- UA

    %% ══════════════════════════════════════════════
    %% SAVED TIMETABLE — Entity + Attributes
    %% ══════════════════════════════════════════════
    UA ----- CS{"Can see"} ----- ST["<b>Saved Timetable</b>"]
    ST_id(["<b><u>saved_id</u></b>"]) --- ST
    ST_uid(["User_id  FK"]) --- ST
    ST_title(["title"]) --- ST
    ST_data(["Timetable_data"]) --- ST
    ST_cat(["Created_at"]) --- ST

    %% ══════════════════════════════════════════════
    %% SUBJECT — Entity + Attributes
    %% ══════════════════════════════════════════════
    SUB_id(["<b><u>id</u></b>"]) --- SUB["<b>Subject</b>"]
    SUB_cid(["Class_id"]) --- SUB
    SUB_name(["Subject_name"]) --- SUB
    SUB_th(["Theory_hours"]) --- SUB
    SUB_ph(["Practical_hours"]) --- SUB

    %% ══════════════════════════════════════════════
    %% TEACHER — Entity + Attributes
    %% ══════════════════════════════════════════════
    SUB ----- AM{"Admin<br/>manages<br/>both"} ----- TCH["<b>Teacher</b>"]
    TCH_id(["<b><u>id</u></b>"]) --- TCH
    TCH_name(["teacher_name"]) --- TCH

    %% ══════════════════════════════════════════════
    %% Styling — Entities
    %% ══════════════════════════════════════════════
    style UA fill:#ffffff,stroke:#000000,stroke-width:3px,color:#000
    style ST fill:#ffffff,stroke:#000000,stroke-width:3px,color:#000
    style SUB fill:#ffffff,stroke:#000000,stroke-width:3px,color:#000
    style TCH fill:#ffffff,stroke:#000000,stroke-width:3px,color:#000

    %% Styling — Relationships (diamonds)
    style CS fill:#ffffff,stroke:#000000,stroke-width:2px,color:#000
    style AM fill:#ffffff,stroke:#000000,stroke-width:2px,color:#000

    %% Styling — Attributes (ovals)
    style UA_id fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000
    style UA_name fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000
    style UA_email fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000
    style UA_pass fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000
    style UA_role fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000
    style UA_inst fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000

    style ST_id fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000
    style ST_uid fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000
    style ST_title fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000
    style ST_data fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000
    style ST_cat fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000

    style SUB_id fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000
    style SUB_cid fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000
    style SUB_name fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000
    style SUB_th fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000
    style SUB_ph fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000

    style TCH_id fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000
    style TCH_name fill:#ffffff,stroke:#000000,stroke-width:1.5px,color:#000
```
