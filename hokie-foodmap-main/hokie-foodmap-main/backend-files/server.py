#Should host the file on a little sql server
import pyodbc
import pandas as pd

print(pyodbc.drivers()) #This should grant acess to the data of the sql
#server that will run on my laptop using the data 

connections = pyodbc.connect (
    Trusted_Connection = "Yes",
    Driver = 'ODBC Driver 17 for SQL Server',
    Server = "localhost\\TEW_SQLEXPRESS",
    Database = "tew_app_project"
)
#This is supposed to create the connection to the sql server that is on
#my laptop referencing the current tags or whatever

cursor = connections.cursor()

inputfile = pd.read_csv("account.csv")
print(inputfile.columns) #this gets the reference to the csv file, 
#so it can assign the rows and columns of the data 

fix_columns = inputfile.columns[0]
new_columns = fix_columns.strip().replace(":", "").replace(" ", "_") 
inputfile.columns = [new_columns]
#Replaces the Accounts: for clearing format in the server 

#This creates the table itself 
cursor.execute(f"""
               IF NOT EXISTS (
                   SELECT * FROM INFORMATION_SCHEMA.TABLES 
                   WHERE TABLE_NAME = 'account'
               )

               BEGIN 
                    CREATE TABLE account (
                        {new_columns} VARCHAR(255)
                    )
                END 
""")
connections.commit() #Commits the creation of the table to the server 
#then loops it to actually connect all da data 
for row in inputfile.itertuples(index=False):
    cursor.execute(f"INSERT INTO account ({new_columns}) VALUES (?)", row[0])

connections.commit()
connections.close()