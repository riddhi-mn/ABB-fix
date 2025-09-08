#Base image for running the app
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base  
WORKDIR /app
EXPOSE 80

#Build stage 
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

#Copy only the project file
COPY ["IntelliInspect.API.csproj", "."]
RUN dotnet restore "./IntelliInspect.API.csproj"
#copy source code
COPY . .
WORKDIR "/src/."
RUN dotnet build "IntelliInspect.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "IntelliInspect.API.csproj" -c Release -o /app/publish
#final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .  
ENTRYPOINT ["dotnet", "IntelliInspect.API.dll"]
