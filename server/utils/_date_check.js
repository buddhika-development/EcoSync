export const isCurrentMonth = (dateString) => {
  const updatedDate = new Date(dateString);
  const now = new Date();
  
  return updatedDate.getFullYear() === now.getFullYear() && 
         updatedDate.getMonth() === now.getMonth();
}